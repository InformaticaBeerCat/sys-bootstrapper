export const NETWORK_CHANNELS = {
  getPrivateIp: 'network:get-private-ip',
  getPublicIp: 'network:get-public-ip',
  getOverview: 'network:get-overview',
  getPublicIpDetails: 'network:get-public-ip-details',
  getRoutes: 'network:get-routes',
  getNeighbors: 'network:get-neighbors',
  getListeningPorts: 'network:get-listening-ports',
  dnsLookup: 'network:dns-lookup',
  checkPorts: 'network:check-ports',
  inspectTls: 'network:inspect-tls',
  getReport: 'network:get-report',
  saveReport: 'network:save-report'
} as const

export type IpRangeKind = 'private' | 'cgnat' | 'public' | 'loopback' | 'link-local' | 'unknown'

export interface PrivateIpInfo {
  address: string | null
  interfaceName: string | null
  kind: IpRangeKind
}

export interface PublicIpInfo {
  address: string | null
  /** Detalle técnico del último proveedor que falló (sin traducir); el mensaje visible lo arma el renderer. */
  error: string | null
  kind: IpRangeKind
}

// ---------- Resumen / interfaces ----------

export type InterfaceKind = 'ethernet' | 'wifi' | 'vpn' | 'virtual' | 'loopback' | 'other'

/** universal = MAC de fábrica; local = localmente administrada (MAC privada/aleatoria de Wi-Fi, VMs, contenedores). */
export type MacKind = 'universal' | 'local' | 'multicast' | 'broadcast'

export interface Ipv4Subnet {
  /** Dirección de red en notación CIDR, ej. 192.168.1.0/24. */
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  hostCount: number
}

export interface InterfaceAddress {
  family: 'IPv4' | 'IPv6'
  address: string
  netmask: string
  prefixLength: number | null
  kind: IpRangeKind
  /** Solo IPv4. */
  subnet: Ipv4Subnet | null
}

export interface NetworkInterfaceInfo {
  name: string
  /** Nombre que le da el SO cuando existe (macOS: puerto de hardware, ej. "Wi-Fi"). */
  label: string | null
  kind: InterfaceKind
  mac: string | null
  macKind: MacKind | null
  /** macOS entrega 02:00:00:00:00:00 a las apps sin permiso de "Red local": la MAC real existe pero no es visible. */
  macHidden: boolean
  /** MAC de fábrica (solo macOS, vía networksetup). Difiere de `mac` cuando la interfaz usa una MAC privada/aleatoria. */
  hardwareMac: string | null
  /** Interfaz por la que sale la ruta por defecto. */
  isPrimary: boolean
  mtu: number | null
  /** Contadores desde el arranque del equipo (o desde que se levantó la interfaz). */
  rxBytes: number | null
  txBytes: number | null
  addresses: InterfaceAddress[]
}

export interface GatewayInfo {
  address: string | null
  interfaceName: string | null
}

export interface ProxyInfo {
  /** Regla que resuelve Chromium para una URL externa: "DIRECT" o "PROXY host:puerto; ...". */
  rule: string | null
  direct: boolean
  /** Variables HTTP_PROXY/HTTPS_PROXY/ALL_PROXY/NO_PROXY presentes (con la contraseña enmascarada). */
  env: Record<string, string>
  error: string | null
}

export interface NetworkOverview {
  hostname: string
  platform: string
  /** net.isOnline() de Electron. */
  online: boolean
  interfaces: NetworkInterfaceInfo[]
  gateway: GatewayInfo
  dnsServers: string[]
  proxy: ProxyInfo
  collectedAt: string
}

export interface PublicIpDetails {
  ipv4: string | null
  /** null = sin conectividad IPv6 pública. */
  ipv6: string | null
  kind: IpRangeKind
  reverseDns: string | null
  isp: string | null
  asn: string | null
  city: string | null
  region: string | null
  countryCode: string | null
  timezone: string | null
  /** Servicio del que salieron ISP/ubicación. */
  geoSource: string | null
  /** Falla al obtener la IP pública (sin traducir). */
  error: string | null
  /** Falla al obtener ISP/ubicación; no invalida la IP (sin traducir). */
  geoError: string | null
}

// ---------- Rutas y vecinos ----------

export interface RouteEntry {
  /** "default" o red en CIDR (las rutas a host van sin prefijo). */
  destination: string
  /** null = red conectada directamente (on-link). */
  gateway: string | null
  interfaceName: string | null
  metric: number | null
  flags: string | null
  isDefault: boolean
}

export interface RoutesResult {
  routes: RouteEntry[]
  error: string | null
}

export interface NeighborEntry {
  address: string
  mac: string
  macKind: MacKind
  interfaceName: string | null
  state: 'static' | 'dynamic'
}

export interface NeighborsResult {
  neighbors: NeighborEntry[]
  /** macOS devolvió la caché vacía: sin permiso de "Red local" el SO la oculta. */
  restricted: boolean
  error: string | null
}

// ---------- Puertos en escucha ----------

/** all = escucha en todas las interfaces (alcanzable desde la red); loopback = solo desde este equipo. */
export type SocketExposure = 'all' | 'loopback' | 'specific'

export interface ListeningSocket {
  protocol: 'TCP' | 'UDP'
  /** "*" cuando escucha en todas las interfaces (0.0.0.0 / ::). */
  address: string
  port: number
  exposure: SocketExposure
  process: string | null
  /** Varios PIDs cuando un servicio comparte el socket entre workers (Apache, Nginx...). */
  pids: number[]
  user: string | null
  service: string | null
}

export interface ListeningPortsResult {
  sockets: ListeningSocket[]
  /** true si la app no corre como root/admin y pueden faltar sockets o procesos de otros usuarios. */
  partial: boolean
  error: string | null
}

// ---------- Diagnóstico ----------

/** SYSTEM = getaddrinfo (respeta /etc/hosts); CHROMIUM = resolver de Electron; el resto son consultas DNS directas. */
export const DNS_QUERY_TYPES = ['SYSTEM', 'CHROMIUM', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA', 'PTR'] as const
export type DnsQueryType = (typeof DNS_QUERY_TYPES)[number]

export interface DnsLookupParams {
  hostname: string
  type: DnsQueryType
  /** IP del servidor DNS a consultar; null = los del sistema. Se ignora en SYSTEM y CHROMIUM. */
  server: string | null
}

export interface DnsLookupResult {
  records: string[]
  server: string
  elapsedMs: number
  /** Código de error de c-ares/Node (ENOTFOUND, ENODATA, ETIMEOUT...) o mensaje. */
  error: string | null
}

export const MAX_PORT_CHECK = 64

export type PortState = 'open' | 'closed' | 'timeout' | 'error'

export interface PortCheckParams {
  host: string
  ports: number[]
}

export interface PortProbeResult {
  port: number
  state: PortState
  latencyMs: number | null
  error: string | null
  service: string | null
}

export interface PortCheckResult {
  host: string
  /** IP a la que se resolvió el host. */
  address: string | null
  results: PortProbeResult[]
  error: string | null
}

export interface TlsInspectParams {
  host: string
  port: number
}

export interface TlsCertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  daysRemaining: number
  altNames: string[]
  serialNumber: string
  fingerprint256: string
  /** Ej. "RSA 2048 bits" o "EC P-256". */
  key: string | null
  selfSigned: boolean
}

export interface TlsInspectResult {
  host: string
  port: number
  /** Cadena de confianza + nombre del host válidos. */
  authorized: boolean
  authorizationError: string | null
  protocol: string | null
  cipher: string | null
  alpn: string | null
  /** Hoja primero, raíz al final. */
  chain: TlsCertificateInfo[]
  elapsedMs: number
  error: string | null
}

// ---------- Informe ----------

export interface NetworkReport {
  generatedAt: string
  overview: NetworkOverview
  publicIp: PublicIpDetails
  routes: RoutesResult
  neighbors: NeighborsResult
  listeningPorts: ListeningPortsResult
}

export interface SaveNetworkReportResult {
  success: boolean
  filePath?: string
  error?: string
}

// ---------- Utilidades de direcciones ----------

export function ipv4ToInt(address: string): number | null {
  const parts = address.split('.')
  if (parts.length !== 4) return null
  const octets = parts.map((part) => (/^\d{1,3}$/.test(part) ? Number(part) : NaN))
  if (octets.some((n) => Number.isNaN(n) || n > 255)) return null
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
}

export function intToIpv4(value: number): string {
  return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.')
}

/** 255.255.255.0 → 24. null si la máscara no es contigua. */
export function ipv4MaskToPrefix(mask: string): number | null {
  const value = ipv4ToInt(mask)
  if (value === null) return null
  const prefix = value.toString(2).replace(/0+$/, '').length
  const expected = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return value === expected ? prefix : null
}

export function computeIpv4Subnet(address: string, prefixLength: number): Ipv4Subnet | null {
  const ip = ipv4ToInt(address)
  if (ip === null || prefixLength < 0 || prefixLength > 32) return null
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  // /31 (RFC 3021, enlaces punto a punto) y /32 no reservan dirección de red ni broadcast.
  const pointToPoint = prefixLength >= 31
  return {
    network: `${intToIpv4(network)}/${prefixLength}`,
    broadcast: intToIpv4(broadcast),
    firstHost: intToIpv4(pointToPoint ? network : network + 1),
    lastHost: intToIpv4(pointToPoint ? broadcast : broadcast - 1),
    hostCount: pointToPoint ? 2 ** (32 - prefixLength) : 2 ** (32 - prefixLength) - 2
  }
}

/**
 * Clasifica una IPv4 según los rangos reservados relevantes para detectar CG-NAT/VPN:
 * - 100.64.0.0/10 es "Shared Address Space" (RFC 6598), el rango que usan los ISP para CG-NAT.
 * - 10/8, 172.16/12 y 192.168/16 son rangos privados (RFC 1918) típicos de LAN.
 * - 169.254/16 es link-local (APIPA): la IP que se autoasigna el equipo cuando el DHCP no responde.
 * Si la IP que se reporta como "pública" cae en alguno de estos rangos (en vez de ser una IP
 * pública real), es señal de que hay CG-NAT, VPN o un proxy de por medio.
 */
export function classifyIpv4(address: string | null): IpRangeKind {
  if (!address || ipv4ToInt(address) === null) return 'unknown'
  const [a, b] = address.split('.').map(Number)
  if (a === 127) return 'loopback'
  if (a === 169 && b === 254) return 'link-local'
  if (a === 100 && b >= 64 && b <= 127) return 'cgnat'
  if (a === 10) return 'private'
  if (a === 172 && b >= 16 && b <= 31) return 'private'
  if (a === 192 && b === 168) return 'private'
  return 'public'
}

/** fe80::/10 link-local, fc00::/7 ULA (equivalente a los rangos privados), 2000::/3 global. */
export function classifyIpv6(address: string): IpRangeKind {
  const bare = address.toLowerCase().split('%')[0]
  if (bare === '::1') return 'loopback'
  if (bare.startsWith('::ffff:')) return classifyIpv4(bare.slice(7))
  const first = parseInt(bare.split(':')[0] || '0', 16)
  if (Number.isNaN(first)) return 'unknown'
  if ((first & 0xffc0) === 0xfe80) return 'link-local'
  if ((first & 0xfe00) === 0xfc00) return 'private'
  if ((first & 0xe000) === 0x2000) return 'public'
  return 'unknown'
}

export function classifyIp(address: string): IpRangeKind {
  return address.includes(':') ? classifyIpv6(address) : classifyIpv4(address)
}

/** MAC que macOS devuelve en lugar de la real a las apps sin permiso de "Red local". */
export const REDACTED_MAC = '02:00:00:00:00:00'

/** Normaliza a xx:xx:xx:xx:xx:xx (macOS imprime "1:0:5e:0:0:fb", Windows usa guiones). */
export function normalizeMac(mac: string): string | null {
  const parts = mac.trim().toLowerCase().split(/[:-]/)
  if (parts.length !== 6 || parts.some((part) => !/^[0-9a-f]{1,2}$/.test(part))) return null
  const normalized = parts.map((part) => part.padStart(2, '0')).join(':')
  return normalized === '00:00:00:00:00:00' ? null : normalized
}

export function macKindOf(mac: string): MacKind {
  if (mac === 'ff:ff:ff:ff:ff:ff') return 'broadcast'
  const firstOctet = parseInt(mac.slice(0, 2), 16)
  if (firstOctet & 1) return 'multicast'
  return firstOctet & 2 ? 'local' : 'universal'
}

export function socketExposure(address: string): SocketExposure {
  if (address === '*') return 'all'
  return classifyIp(address) === 'loopback' ? 'loopback' : 'specific'
}

const WELL_KNOWN_PORTS: Record<number, string> = {
  20: 'FTP-data',
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  67: 'DHCP',
  68: 'DHCP',
  69: 'TFTP',
  80: 'HTTP',
  88: 'Kerberos',
  110: 'POP3',
  111: 'RPCbind',
  123: 'NTP',
  135: 'MS-RPC',
  137: 'NetBIOS',
  138: 'NetBIOS',
  139: 'NetBIOS/SMB',
  143: 'IMAP',
  161: 'SNMP',
  389: 'LDAP',
  443: 'HTTPS',
  445: 'SMB',
  465: 'SMTPS',
  500: 'IKE (IPsec)',
  514: 'Syslog',
  548: 'AFP',
  587: 'SMTP submission',
  631: 'IPP/CUPS',
  636: 'LDAPS',
  853: 'DNS over TLS',
  873: 'rsync',
  993: 'IMAPS',
  995: 'POP3S',
  1080: 'SOCKS',
  1194: 'OpenVPN',
  1433: 'SQL Server',
  1521: 'Oracle',
  1883: 'MQTT',
  2049: 'NFS',
  2375: 'Docker',
  2376: 'Docker (TLS)',
  3000: 'Dev server',
  3306: 'MySQL',
  3389: 'RDP',
  4500: 'IPsec NAT-T',
  5000: 'AirPlay / Flask',
  5173: 'Vite',
  5353: 'mDNS',
  5432: 'PostgreSQL',
  5672: 'AMQP',
  5900: 'VNC',
  6379: 'Redis',
  6443: 'Kubernetes API',
  7000: 'AirPlay',
  8000: 'HTTP-alt',
  8080: 'HTTP-alt',
  8443: 'HTTPS-alt',
  9000: 'PHP-FPM',
  9090: 'Prometheus',
  9200: 'Elasticsearch',
  9418: 'Git',
  11211: 'Memcached',
  15672: 'RabbitMQ UI',
  27017: 'MongoDB',
  51820: 'WireGuard'
}

export function serviceForPort(port: number): string | null {
  return WELL_KNOWN_PORTS[port] ?? null
}

/**
 * "22, 80, 8000-8010" → [22, 80, 8000, ..., 8010], sin duplicados.
 * null si hay algo inválido. Corta apenas supera MAX_PORT_CHECK para que un "1-65535" no genere
 * la lista entera; quien llama detecta el exceso por el largo.
 */
export function parsePortList(input: string): number[] | null {
  const ports = new Set<number>()
  for (const chunk of input.split(/[\s,;]+/).filter(Boolean)) {
    const range = /^(\d+)-(\d+)$/.exec(chunk)
    const from = Number(range ? range[1] : chunk)
    const to = Number(range ? range[2] : chunk)
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 65535 || from > to) return null
    for (let port = from; port <= to; port++) {
      ports.add(port)
      if (ports.size > MAX_PORT_CHECK) return [...ports]
    }
  }
  return [...ports]
}
