import { lookup, Resolver } from 'node:dns/promises'
import { connect as tcpConnect, isIP } from 'node:net'
import { performance } from 'node:perf_hooks'
import { connect as tlsConnect, type DetailedPeerCertificate, type PeerCertificate } from 'node:tls'
import { net } from 'electron'
import {
  MAX_PORT_CHECK,
  serviceForPort,
  type DnsLookupParams,
  type DnsLookupResult,
  type DnsQueryType,
  type PortCheckParams,
  type PortCheckResult,
  type PortProbeResult,
  type TlsCertificateInfo,
  type TlsInspectParams,
  type TlsInspectResult
} from '../../shared/network'

const DNS_TIMEOUT_MS = 3000
const TCP_TIMEOUT_MS = 3000
const TLS_TIMEOUT_MS = 6000

function errorCode(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | null)?.code
  if (code) return code
  return error instanceof Error ? error.message : String(error)
}

function elapsedSince(started: number): number {
  return Math.round(performance.now() - started)
}

function isValidHost(host: unknown): host is string {
  return typeof host === 'string' && host.trim().length > 0 && host.trim().length <= 253 && !/\s/.test(host.trim())
}

// ---------- DNS ----------

async function queryRecords(resolver: Resolver, hostname: string, type: DnsQueryType): Promise<string[]> {
  switch (type) {
    case 'SYSTEM': {
      const addresses = await lookup(hostname, { all: true, verbatim: true })
      return addresses.map((entry) => `${entry.address}  (IPv${entry.family})`)
    }
    case 'CHROMIUM': {
      const { endpoints } = await net.resolveHost(hostname, { cacheUsage: 'disallowed' })
      return endpoints.map((endpoint) => `${endpoint.address}  (${endpoint.family})`)
    }
    case 'A':
      return (await resolver.resolve4(hostname, { ttl: true })).map((r) => `${r.address}  TTL ${r.ttl}s`)
    case 'AAAA':
      return (await resolver.resolve6(hostname, { ttl: true })).map((r) => `${r.address}  TTL ${r.ttl}s`)
    case 'CNAME':
      return resolver.resolveCname(hostname)
    case 'MX':
      return (await resolver.resolveMx(hostname))
        .sort((a, b) => a.priority - b.priority)
        .map((r) => `${r.priority} ${r.exchange}`)
    case 'TXT':
      // Un TXT puede venir partido en varios strings de hasta 255 bytes; se unen como hace dig.
      return (await resolver.resolveTxt(hostname)).map((chunks) => `"${chunks.join('')}"`)
    case 'NS':
      return resolver.resolveNs(hostname)
    case 'SOA': {
      const soa = await resolver.resolveSoa(hostname)
      return [`${soa.nsname} ${soa.hostmaster} ${soa.serial} ${soa.refresh} ${soa.retry} ${soa.expire} ${soa.minttl}`]
    }
    case 'SRV':
      return (await resolver.resolveSrv(hostname)).map((r) => `${r.priority} ${r.weight} ${r.port} ${r.name}`)
    case 'CAA':
      // Cada registro llega como { critical, issue | issuewild | iodef | ..., type: 'CAA' }.
      return (await resolver.resolveCaa(hostname)).flatMap((record) =>
        Object.entries(record)
          .filter(([tag]) => tag !== 'critical' && tag !== 'type')
          .map(([tag, value]) => `${record.critical} ${tag} "${value}"`)
      )
    case 'PTR':
      if (!isIP(hostname)) throw Object.assign(new Error('PTR requiere una IP'), { code: 'EINVALIDIP' })
      return resolver.reverse(hostname)
  }
}

export async function dnsLookup(params: DnsLookupParams): Promise<DnsLookupResult> {
  const started = performance.now()
  const hostname = typeof params?.hostname === 'string' ? params.hostname.trim() : ''
  const resolver = new Resolver({ timeout: DNS_TIMEOUT_MS, tries: 2 })
  let server = params.type === 'SYSTEM' ? 'getaddrinfo' : params.type === 'CHROMIUM' ? 'Chromium' : ''

  try {
    if (!isValidHost(hostname)) throw Object.assign(new Error('host inválido'), { code: 'EINVALIDHOST' })
    if (!server) {
      if (params.server) resolver.setServers([params.server.trim()])
      server = resolver.getServers()[0] ?? '—'
    }
    const records = await queryRecords(resolver, hostname, params.type)
    return { records, server, elapsedMs: elapsedSince(started), error: null }
  } catch (error) {
    return { records: [], server: server || params.server || '—', elapsedMs: elapsedSince(started), error: errorCode(error) }
  }
}

// ---------- Puertos TCP ----------

function probeTcp(address: string, port: number): Promise<PortProbeResult> {
  return new Promise((resolve) => {
    const started = performance.now()
    let settled = false
    const socket = tcpConnect({ host: address, port, timeout: TCP_TIMEOUT_MS })

    const finish = (state: PortProbeResult['state'], error: string | null = null) => {
      if (settled) return
      settled = true
      socket.destroy()
      // Un RST (cerrado) también mide ida y vuelta; el timeout no aporta latencia real.
      const latencyMs = state === 'open' || state === 'closed' ? elapsedSince(started) : null
      resolve({ port, state, latencyMs, error, service: serviceForPort(port) })
    }

    socket.once('connect', () => finish('open'))
    socket.once('timeout', () => finish('timeout'))
    socket.once('error', (error: NodeJS.ErrnoException) =>
      finish(error.code === 'ECONNREFUSED' ? 'closed' : 'error', errorCode(error))
    )
  })
}

export async function checkPorts(params: PortCheckParams): Promise<PortCheckResult> {
  const host = typeof params?.host === 'string' ? params.host.trim() : ''
  const ports = Array.isArray(params?.ports)
    ? params.ports.filter((port) => Number.isInteger(port) && port >= 1 && port <= 65535).slice(0, MAX_PORT_CHECK)
    : []
  if (!isValidHost(host) || ports.length === 0) return { host, address: null, results: [], error: 'EINVALIDINPUT' }

  let address: string
  try {
    // Se resuelve una sola vez para que todos los puertos se prueben contra la misma IP.
    address = (await lookup(host)).address
  } catch (error) {
    return { host, address: null, results: [], error: errorCode(error) }
  }

  const results = await Promise.all(ports.map((port) => probeTcp(address, port)))
  return { host, address, results, error: null }
}

// ---------- Certificados TLS ----------

function dnValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value.join(', ')
  return value || null
}

/** "CN (O)", ej. "R11 (Let's Encrypt)". */
function describeDn(dn: PeerCertificate['subject'] | undefined): string {
  const cn = dnValue(dn?.CN)
  const org = dnValue(dn?.O)
  if (cn && org && cn !== org) return `${cn} (${org})`
  return cn ?? org ?? '—'
}

function describeKey(cert: PeerCertificate): string | null {
  if (cert.nistCurve) return `EC ${cert.nistCurve}`
  if (cert.asn1Curve) return `EC ${cert.asn1Curve}`
  if (cert.bits) return `RSA ${cert.bits} bits`
  return null
}

function describeCertificate(cert: PeerCertificate): TlsCertificateInfo {
  const validTo = new Date(cert.valid_to)
  return {
    subject: describeDn(cert.subject),
    issuer: describeDn(cert.issuer),
    validFrom: new Date(cert.valid_from).toISOString(),
    validTo: validTo.toISOString(),
    daysRemaining: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
    altNames: (cert.subjectaltname ?? '')
      .split(', ')
      .filter(Boolean)
      .map((name) => name.replace(/^(DNS|IP Address):/, '')),
    serialNumber: cert.serialNumber,
    fingerprint256: cert.fingerprint256,
    key: describeKey(cert),
    selfSigned: JSON.stringify(cert.subject) === JSON.stringify(cert.issuer)
  }
}

function readChain(leaf: DetailedPeerCertificate): TlsCertificateInfo[] {
  const chain: TlsCertificateInfo[] = []
  const seen = new Set<string>()
  let cert: DetailedPeerCertificate | undefined = leaf
  // La raíz apunta a sí misma como emisora; `seen` corta el ciclo.
  while (cert?.fingerprint256 && !seen.has(cert.fingerprint256) && chain.length < 10) {
    seen.add(cert.fingerprint256)
    chain.push(describeCertificate(cert))
    cert = cert.issuerCertificate
  }
  return chain
}

export function inspectTls(params: TlsInspectParams): Promise<TlsInspectResult> {
  const host = typeof params?.host === 'string' ? params.host.trim() : ''
  const port = Number(params?.port)
  const started = performance.now()
  const base: TlsInspectResult = {
    host,
    port,
    authorized: false,
    authorizationError: null,
    protocol: null,
    cipher: null,
    alpn: null,
    chain: [],
    elapsedMs: 0,
    error: null
  }
  if (!isValidHost(host) || !Number.isInteger(port) || port < 1 || port > 65535) {
    return Promise.resolve({ ...base, error: 'EINVALIDINPUT' })
  }

  return new Promise((resolve) => {
    let settled = false
    // rejectUnauthorized: false para poder inspeccionar también certificados vencidos o autofirmados;
    // igual Node deja en authorized/authorizationError si la cadena y el nombre de host son válidos.
    const socket = tlsConnect({
      host,
      port,
      servername: isIP(host) ? undefined : host,
      rejectUnauthorized: false,
      ALPNProtocols: ['h2', 'http/1.1'],
      timeout: TLS_TIMEOUT_MS
    })

    const finish = (patch: Partial<TlsInspectResult>) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve({ ...base, ...patch, elapsedMs: elapsedSince(started) })
    }

    socket.once('secureConnect', () => {
      const authorizationError = socket.authorizationError as unknown
      finish({
        authorized: socket.authorized,
        authorizationError: authorizationError ? errorCode(authorizationError) : null,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher()?.name ?? null,
        alpn: socket.alpnProtocol || null,
        chain: readChain(socket.getPeerCertificate(true))
      })
    })
    socket.once('timeout', () => finish({ error: 'ETIMEDOUT' }))
    socket.once('error', (error) => finish({ error: errorCode(error) }))
  })
}
