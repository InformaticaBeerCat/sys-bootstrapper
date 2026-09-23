import { readFile } from 'node:fs/promises'
import { isIP } from 'node:net'
import {
  ipv4MaskToPrefix,
  ipv4ToInt,
  macKindOf,
  normalizeMac,
  type GatewayInfo,
  type NeighborEntry,
  type NeighborsResult,
  type RouteEntry,
  type RoutesResult
} from '../../shared/network'
import { describeError, runCommand } from './exec'
import { interfaceNamesByIp } from './interfaces'

/**
 * netstat de BSD/macOS abrevia los destinos: "192.168.1" = 192.168.1.0/24, "169.254" = /16,
 * "224.0.0/4" = 224.0.0.0/4. Una IP completa sin prefijo es una ruta a host y se deja tal cual.
 */
function normalizeBsdDestination(destination: string): string {
  if (destination === 'default') return destination
  const [address, prefix] = destination.split('/')
  const octets = address.split('.')
  if (!octets.every((octet) => /^\d+$/.test(octet))) return destination
  if (octets.length === 4 && !prefix) return address
  const padded = [...octets, '0', '0', '0'].slice(0, 4).join('.')
  return `${padded}/${prefix ?? octets.length * 8}`
}

async function darwinRoutes(): Promise<RouteEntry[]> {
  const output = await runCommand('netstat', ['-rn', '-f', 'inet'])
  const routes: RouteEntry[] = []
  let inTable = false
  for (const line of output.split('\n')) {
    const cols = line.trim().split(/\s+/)
    if (cols[0] === 'Destination') {
      inTable = true
      continue
    }
    if (!inTable || cols.length < 4) continue
    const [destination, gateway, flags, interfaceName] = cols
    // Flag L = entrada de la caché ARP (IP → MAC); se muestran aparte, en la tabla de vecinos.
    if (flags.includes('L')) continue
    routes.push({
      destination: normalizeBsdDestination(destination),
      gateway: isIP(gateway) ? gateway : null,
      interfaceName,
      metric: null,
      flags,
      isDefault: destination === 'default'
    })
  }
  return routes
}

/** /proc/net/route guarda las IPs en hexadecimal little-endian: 0101A8C0 = 192.168.1.1. */
function procHexToIpv4(hex: string): string {
  const n = parseInt(hex, 16)
  return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255].join('.')
}

const LINUX_ROUTE_FLAGS: Array<[number, string]> = [
  [0x1, 'U'], // up
  [0x2, 'G'], // gateway
  [0x4, 'H'], // host
  [0x200, '!'] // reject
]

async function linuxRoutes(): Promise<RouteEntry[]> {
  // Se lee /proc en vez de `ip route` para no depender de iproute2 (algunos contenedores/distros mínimas no lo traen).
  const content = await readFile('/proc/net/route', 'utf-8')
  return content
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((cols) => cols.length >= 8)
    .map(([interfaceName, destinationHex, gatewayHex, flagsHex, , , metric, maskHex]) => {
      const flags = parseInt(flagsHex, 16)
      const prefix = ipv4MaskToPrefix(procHexToIpv4(maskHex))
      const isDefault = destinationHex === '00000000' && prefix === 0
      return {
        destination: isDefault ? 'default' : `${procHexToIpv4(destinationHex)}/${prefix ?? '?'}`,
        gateway: flags & 0x2 ? procHexToIpv4(gatewayHex) : null,
        interfaceName,
        metric: Number(metric),
        flags: LINUX_ROUTE_FLAGS.filter(([bit]) => flags & bit)
          .map(([, letter]) => letter)
          .join(''),
        isDefault
      }
    })
}

async function windowsRoutes(): Promise<RouteEntry[]> {
  const output = await runCommand('route', ['print', '-4'])
  const namesByIp = interfaceNamesByIp()
  const routes: RouteEntry[] = []
  // Filas de "Rutas activas": destino, máscara, gateway ("On-link"/"En vínculo" según idioma), IP de la interfaz, métrica.
  for (const line of output.split(/\r?\n/)) {
    const match = /^\s*(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\S+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+)\s*$/.exec(line)
    if (!match) continue
    const [, destination, mask, gateway, interfaceIp, metric] = match
    const prefix = ipv4MaskToPrefix(mask)
    const isDefault = destination === '0.0.0.0' && prefix === 0
    routes.push({
      destination: isDefault ? 'default' : prefix === 32 ? destination : `${destination}/${prefix ?? mask}`,
      gateway: isIP(gateway) ? gateway : null,
      interfaceName: namesByIp.get(interfaceIp) ?? interfaceIp,
      metric: Number(metric),
      flags: null,
      isDefault
    })
  }
  return routes
}

export async function collectRoutes(): Promise<RoutesResult> {
  try {
    const routes =
      process.platform === 'win32'
        ? await windowsRoutes()
        : process.platform === 'linux'
          ? await linuxRoutes()
          : await darwinRoutes()
    return { routes, error: null }
  } catch (error) {
    return { routes: [], error: describeError(error) }
  }
}

export function pickDefaultGateway(routes: RouteEntry[]): GatewayInfo {
  const defaults = routes.filter((route) => route.isDefault && route.gateway)
  // macOS marca con "I" (ifscope) las rutas por defecto atadas a interfaces secundarias; la principal no la lleva.
  const unscoped = defaults.filter((route) => !route.flags?.includes('I'))
  const candidates = unscoped.length > 0 ? unscoped : defaults
  const best = [...candidates].sort((a, b) => (a.metric ?? 0) - (b.metric ?? 0))[0]
  return best ? { address: best.gateway, interfaceName: best.interfaceName } : { address: null, interfaceName: null }
}

interface RawNeighbor {
  address: string
  mac: string | null
  interfaceName: string | null
  isStatic: boolean
}

async function darwinNeighbors(): Promise<RawNeighbor[]> {
  const output = await runCommand('arp', ['-an'])
  // "? (192.168.1.1) at a4:91:b1:0:1:2 on en0 ifscope [ethernet]"; los incompletos dicen "(incomplete)".
  return output.split('\n').flatMap((line) => {
    const match = /^\S+ \(([\d.]+)\) at (\S+) on (\S+)(.*)$/.exec(line.trim())
    if (!match) return []
    return [{ address: match[1], mac: normalizeMac(match[2]), interfaceName: match[3], isStatic: /permanent/.test(match[4]) }]
  })
}

async function linuxNeighbors(): Promise<RawNeighbor[]> {
  // Columnas: IP address, HW type, Flags, HW address, Mask, Device. Flag 0x4 = entrada permanente.
  const content = await readFile('/proc/net/arp', 'utf-8')
  return content
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((cols) => cols.length >= 6)
    .map(([address, , flags, mac, , device]) => ({
      address,
      mac: normalizeMac(mac),
      interfaceName: device,
      isStatic: (parseInt(flags, 16) & 0x4) !== 0
    }))
}

async function windowsNeighbors(): Promise<RawNeighbor[]> {
  const output = await runCommand('arp', ['-a'])
  const namesByIp = interfaceNamesByIp()
  const neighbors: RawNeighbor[] = []
  let currentInterface: string | null = null
  for (const line of output.split(/\r?\n/)) {
    // "Interface: 192.168.1.100 --- 0xb" ("Interfaz:" en español): agrupa las filas siguientes.
    const header = /^\S+:\s+(\d+\.\d+\.\d+\.\d+)\s+---/.exec(line)
    if (header) {
      currentInterface = namesByIp.get(header[1]) ?? header[1]
      continue
    }
    const row = /^\s+(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f]{2}(?:-[0-9a-f]{2}){5})\s+(\S+)/i.exec(line)
    if (!row) continue
    neighbors.push({
      address: row[1],
      mac: normalizeMac(row[2]),
      interfaceName: currentInterface,
      isStatic: /static|est[aá]tic/i.test(row[3])
    })
  }
  return neighbors
}

export async function collectNeighbors(): Promise<NeighborsResult> {
  try {
    const raw =
      process.platform === 'win32'
        ? await windowsNeighbors()
        : process.platform === 'linux'
          ? await linuxNeighbors()
          : await darwinNeighbors()

    const neighbors: NeighborEntry[] = []
    for (const entry of raw) {
      if (!entry.mac) continue
      const macKind = macKindOf(entry.mac)
      // Broadcast y multicast no son equipos reales, solo ruido de la caché.
      if (macKind === 'broadcast' || macKind === 'multicast') continue
      neighbors.push({
        address: entry.address,
        mac: entry.mac,
        macKind,
        interfaceName: entry.interfaceName,
        state: entry.isStatic ? 'static' : 'dynamic'
      })
    }
    neighbors.sort((a, b) => (ipv4ToInt(a.address) ?? 0) - (ipv4ToInt(b.address) ?? 0))
    // Con red activa la caché ARP nunca está vacía (al menos está el router); en macOS vacía = censurada por privacidad.
    return { neighbors, restricted: process.platform === 'darwin' && raw.length === 0, error: null }
  } catch (error) {
    return { neighbors: [], restricted: false, error: describeError(error) }
  }
}
