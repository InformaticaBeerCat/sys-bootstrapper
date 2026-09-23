import { Resolver } from 'node:dns/promises'
import { classifyIpv4, type PublicIpDetails, type PublicIpInfo } from '../../shared/network'
import { describeError } from './exec'

const FETCH_TIMEOUT_MS = 5000

async function fetchOk(url: string): Promise<Response> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`${new URL(url).host}: HTTP ${res.status}`)
  return res
}

async function fetchFromIpify(): Promise<string> {
  const data = (await (await fetchOk('https://api.ipify.org?format=json')).json()) as { ip: string }
  return data.ip
}

async function fetchFromIcanhazip(): Promise<string> {
  // Se usa el subdominio ipv4. explícito: en redes dual-stack, icanhazip.com a secas
  // puede devolver la IPv6 del equipo, que no es comparable con la IP privada (siempre IPv4).
  const text = await (await fetchOk('https://ipv4.icanhazip.com')).text()
  return text.trim()
}

// Estos hosts solo tienen registro AAAA: si responden, el equipo tiene salida IPv6 pública.
async function fetchIpv6FromIpify(): Promise<string> {
  const data = (await (await fetchOk('https://api6.ipify.org?format=json')).json()) as { ip: string }
  return data.ip
}

async function fetchIpv6FromIcanhazip(): Promise<string> {
  const text = await (await fetchOk('https://ipv6.icanhazip.com')).text()
  return text.trim()
}

// Se intenta con varios proveedores gratuitos por si alguno está caído o bloqueado en la red del usuario.
const PUBLIC_IPV4_PROVIDERS = [fetchFromIpify, fetchFromIcanhazip]
const PUBLIC_IPV6_PROVIDERS = [fetchIpv6FromIpify, fetchIpv6FromIcanhazip]

async function firstAddress(providers: Array<() => Promise<string>>): Promise<{ address: string | null; error: string | null }> {
  let lastError: string | null = null
  for (const fetchIp of providers) {
    try {
      const address = await fetchIp()
      if (address) return { address, error: null }
    } catch (error) {
      lastError = describeError(error)
    }
  }
  return { address: null, error: lastError }
}

export async function resolvePublicIp(): Promise<PublicIpInfo> {
  const { address, error } = await firstAddress(PUBLIC_IPV4_PROVIDERS)
  return { address, error, kind: classifyIpv4(address) }
}

type GeoInfo = Pick<PublicIpDetails, 'isp' | 'asn' | 'city' | 'region' | 'countryCode' | 'timezone' | 'geoSource'>

const EMPTY_GEO: GeoInfo = {
  isp: null,
  asn: null,
  city: null,
  region: null,
  countryCode: null,
  timezone: null,
  geoSource: null
}

async function geoFromIpinfo(ip: string): Promise<GeoInfo> {
  const data = (await (await fetchOk(`https://ipinfo.io/${encodeURIComponent(ip)}/json`)).json()) as {
    org?: string
    city?: string
    region?: string
    country?: string
    timezone?: string
  }
  // "org" llega como "AS7922 Comcast Cable Communications, LLC".
  const org = /^(AS\d+)\s+(.+)$/.exec(data.org ?? '')
  return {
    isp: org?.[2] ?? data.org ?? null,
    asn: org?.[1] ?? null,
    city: data.city || null,
    region: data.region || null,
    countryCode: data.country || null,
    timezone: data.timezone || null,
    geoSource: 'ipinfo.io'
  }
}

async function geoFromIpwhois(ip: string): Promise<GeoInfo> {
  const data = (await (await fetchOk(`https://ipwho.is/${encodeURIComponent(ip)}`)).json()) as {
    success: boolean
    message?: string
    city?: string
    region?: string
    country_code?: string
    connection?: { asn?: number; isp?: string; org?: string }
    timezone?: { id?: string }
  }
  if (!data.success) throw new Error(`ipwho.is: ${data.message ?? 'error'}`)
  return {
    isp: data.connection?.isp || data.connection?.org || null,
    asn: data.connection?.asn ? `AS${data.connection.asn}` : null,
    city: data.city || null,
    region: data.region || null,
    countryCode: data.country_code || null,
    timezone: data.timezone?.id || null,
    geoSource: 'ipwho.is'
  }
}

const GEO_PROVIDERS = [geoFromIpinfo, geoFromIpwhois]

async function resolveGeo(ip: string): Promise<{ geo: GeoInfo; error: string | null }> {
  let lastError: string | null = null
  for (const provider of GEO_PROVIDERS) {
    try {
      return { geo: await provider(ip), error: null }
    } catch (error) {
      lastError = describeError(error)
    }
  }
  return { geo: EMPTY_GEO, error: lastError }
}

async function reverseLookup(ip: string): Promise<string | null> {
  // Resolver propio con timeout corto: el de dns.reverse() por defecto puede tardar decenas de segundos.
  const resolver = new Resolver({ timeout: 2000, tries: 1 })
  try {
    return (await resolver.reverse(ip))[0] ?? null
  } catch {
    return null
  }
}

export async function resolvePublicIpDetails(): Promise<PublicIpDetails> {
  const [v4, v6] = await Promise.all([firstAddress(PUBLIC_IPV4_PROVIDERS), firstAddress(PUBLIC_IPV6_PROVIDERS)])
  const target = v4.address ?? v6.address
  const base = { ipv4: v4.address, ipv6: v6.address, kind: classifyIpv4(v4.address), error: v4.address ? null : v4.error }
  if (!target) return { ...base, ...EMPTY_GEO, reverseDns: null, geoError: null }

  const [{ geo, error: geoError }, reverseDns] = await Promise.all([resolveGeo(target), reverseLookup(target)])
  return { ...base, ...geo, reverseDns, geoError }
}
