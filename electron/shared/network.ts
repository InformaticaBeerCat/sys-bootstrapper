export type IpRangeKind = 'private' | 'cgnat' | 'public' | 'unknown'

export interface PrivateIpInfo {
  address: string | null
  interfaceName: string | null
  kind: IpRangeKind
}

export interface PublicIpInfo {
  address: string | null
  error: string | null
  kind: IpRangeKind
}

/**
 * Clasifica una IPv4 según los rangos reservados relevantes para detectar CG-NAT/VPN:
 * - 100.64.0.0/10 es "Shared Address Space" (RFC 6598), el rango que usan los ISP para CG-NAT.
 * - 10/8, 172.16/12 y 192.168/16 son rangos privados (RFC 1918) típicos de LAN.
 * Si la IP que se reporta como "pública" cae en alguno de estos rangos (en vez de ser una IP
 * pública real), es señal de que hay CG-NAT, VPN o un proxy de por medio.
 */
export function classifyIpv4(address: string | null): IpRangeKind {
  if (!address) return 'unknown'
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return 'unknown'
  const [a, b] = parts
  if (a === 100 && b >= 64 && b <= 127) return 'cgnat'
  if (a === 10) return 'private'
  if (a === 172 && b >= 16 && b <= 31) return 'private'
  if (a === 192 && b === 168) return 'private'
  return 'public'
}
