import { access, readFile } from 'node:fs/promises'
import { networkInterfaces, type NetworkInterfaceInfo as OsInterfaceAddress } from 'node:os'
import {
  classifyIp,
  computeIpv4Subnet,
  macKindOf,
  normalizeMac,
  REDACTED_MAC,
  type InterfaceAddress,
  type InterfaceKind,
  type NetworkInterfaceInfo
} from '../../shared/network'
import { runCommand } from './exec'

/** Datos que Node no expone y se sacan de herramientas propias de cada SO. */
interface InterfaceExtras {
  label?: string
  hardwareMac?: string
  kindHint?: InterfaceKind
  mtu?: number
  rxBytes?: number
  txBytes?: number
}

// Heurísticas por nombre. En macOS, utun0-3 existen siempre (iCloud, Continuidad) y solo tienen IPv6
// link-local: el renderer los descarta al decidir si hay una VPN activa.
const VPN_NAME = /^(utun|tun|tap|wg|ppp|ipsec|gpd|zt|tailscale|nordlynx)|openvpn|wireguard|zerotier|vpn/i
const VIRTUAL_NAME =
  /^(docker|br-|veth|virbr|vmnet|vboxnet|bridge|awdl|llw|anpi|ap\d|gif|stf|nan\d|lxc|lxd|cni|flannel|cali)|vethernet|virtualbox|vmware|hyper-v|wsl/i
const WIFI_NAME = /^(wl|wlan|wifi|ath)|wi-?fi|wireless|wlan/i
const ETHERNET_NAME = /^(en|eth|em)\d|^en[ops]\d|ethernet/i

const KIND_ORDER: InterfaceKind[] = ['ethernet', 'wifi', 'vpn', 'other', 'virtual', 'loopback']

function guessKind(name: string, internal: boolean, hint?: InterfaceKind): InterfaceKind {
  if (internal || /^lo\d*$/.test(name) || /loopback/i.test(name)) return 'loopback'
  if (VPN_NAME.test(name)) return 'vpn'
  if (hint) return hint
  if (VIRTUAL_NAME.test(name)) return 'virtual'
  if (WIFI_NAME.test(name)) return 'wifi'
  if (ETHERNET_NAME.test(name)) return 'ethernet'
  return 'other'
}

function toNumber(value: string | undefined): number | undefined {
  const n = Number(value)
  return value !== undefined && Number.isFinite(n) ? n : undefined
}

function hardwarePortKind(label: string): InterfaceKind | undefined {
  if (/wi-?fi|airport|wireless/i.test(label)) return 'wifi'
  if (/bridge/i.test(label)) return 'virtual'
  if (/ethernet|\blan\b/i.test(label)) return 'ethernet'
  return undefined
}

async function darwinExtras(): Promise<Map<string, InterfaceExtras>> {
  const extras = new Map<string, InterfaceExtras>()
  const [hardwarePorts, stats] = await Promise.all([
    runCommand('networksetup', ['-listallhardwareports']).catch(() => ''),
    runCommand('netstat', ['-ib']).catch(() => '')
  ])

  // networksetup lee la MAC de fábrica vía SystemConfiguration, que macOS no censura sin el permiso de "Red local".
  for (const match of hardwarePorts.matchAll(/Hardware Port: (.+)\r?\nDevice: (\S+)(?:\r?\nEthernet Address: (\S+))?/g)) {
    const label = match[1].trim()
    const hardwareMac = normalizeMac(match[3] ?? '') ?? undefined
    extras.set(match[2], { label, hardwareMac, kindHint: hardwarePortKind(label) })
  }

  // netstat -ib: una fila <Link#N> por interfaz con los totales. La columna Address puede venir vacía
  // (lo0, utun), así que los contadores se leen desde la derecha:
  // ... Ipkts Ierrs Ibytes Opkts Oerrs Obytes Coll
  for (const line of stats.split('\n')) {
    const cols = line.trim().split(/\s+/)
    if (cols.length < 10 || !cols[2].startsWith('<Link#')) continue
    const name = cols[0].replace(/\*$/, '') // el "*" marca interfaces caídas
    const n = cols.length
    extras.set(name, {
      ...extras.get(name),
      mtu: toNumber(cols[1]),
      rxBytes: toNumber(cols[n - 5]),
      txBytes: toNumber(cols[n - 2])
    })
  }
  return extras
}

async function readNumberFile(path: string): Promise<number | undefined> {
  try {
    return toNumber((await readFile(path, 'utf-8')).trim())
  } catch {
    return undefined
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function linuxExtras(names: string[]): Promise<Map<string, InterfaceExtras>> {
  const entries = await Promise.all(
    names.map(async (name): Promise<[string, InterfaceExtras]> => {
      const base = `/sys/class/net/${name}`
      const [mtu, rxBytes, txBytes, wireless, hasDevice] = await Promise.all([
        readNumberFile(`${base}/mtu`),
        readNumberFile(`${base}/statistics/rx_bytes`),
        readNumberFile(`${base}/statistics/tx_bytes`),
        pathExists(`${base}/wireless`),
        pathExists(`${base}/device`)
      ])
      // Sin "device" en sysfs no hay hardware detrás: bridge, veth, docker, tun...
      const kindHint: InterfaceKind | undefined = wireless ? 'wifi' : hasDevice ? undefined : 'virtual'
      return [name, { mtu, rxBytes, txBytes, kindHint }]
    })
  )
  return new Map(entries)
}

async function win32Extras(): Promise<Map<string, InterfaceExtras>> {
  const extras = new Map<string, InterfaceExtras>()
  const output = await runCommand('netsh', ['interface', 'ipv4', 'show', 'subinterfaces']).catch(() => '')
  // Columnas: MTU  MediaSenseState  Bytes In  Bytes Out  Interface (encabezados traducidos, datos no).
  for (const line of output.split(/\r?\n/)) {
    const match = /^\s*(\d+)\s+\d+\s+(\d+)\s+(\d+)\s+(.+?)\s*$/.exec(line)
    if (!match) continue
    const mtu = Number(match[1])
    extras.set(match[4], {
      // El loopback reporta 4294967295 como MTU.
      mtu: mtu <= 65535 ? mtu : undefined,
      rxBytes: Number(match[2]),
      txBytes: Number(match[3])
    })
  }
  return extras
}

function collectExtras(names: string[]): Promise<Map<string, InterfaceExtras>> {
  switch (process.platform) {
    case 'darwin':
      return darwinExtras()
    case 'linux':
      return linuxExtras(names)
    case 'win32':
      return win32Extras()
    default:
      return Promise.resolve(new Map())
  }
}

function toInterfaceAddress(address: OsInterfaceAddress): InterfaceAddress {
  const prefix = address.cidr ? Number(address.cidr.split('/')[1]) : NaN
  const prefixLength = Number.isInteger(prefix) ? prefix : null
  const family = address.family === 'IPv4' ? 'IPv4' : 'IPv6'
  return {
    family,
    address: address.address,
    netmask: address.netmask,
    prefixLength,
    kind: classifyIp(address.address),
    subnet: family === 'IPv4' && prefixLength !== null ? computeIpv4Subnet(address.address, prefixLength) : null
  }
}

export async function collectInterfaces(primaryInterface: string | null): Promise<NetworkInterfaceInfo[]> {
  const raw = networkInterfaces()
  const extras = await collectExtras(Object.keys(raw))

  const interfaces = Object.entries(raw).map(([name, addresses = []]): NetworkInterfaceInfo => {
    const extra = extras.get(name) ?? {}
    const rawMac = normalizeMac(addresses.find((address) => address.mac)?.mac ?? '')
    const macHidden = process.platform === 'darwin' && rawMac === REDACTED_MAC
    const mac = macHidden ? null : rawMac
    const internal = addresses.some((address) => address.internal)
    return {
      name,
      label: extra.label ?? null,
      kind: guessKind(name, internal, extra.kindHint),
      mac,
      macKind: mac ? macKindOf(mac) : null,
      macHidden,
      hardwareMac: extra.hardwareMac ?? null,
      isPrimary: name === primaryInterface,
      mtu: extra.mtu ?? null,
      rxBytes: extra.rxBytes ?? null,
      txBytes: extra.txBytes ?? null,
      addresses: addresses.map(toInterfaceAddress)
    }
  })

  return interfaces.sort(
    (a, b) =>
      Number(b.isPrimary) - Number(a.isPrimary) ||
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      a.name.localeCompare(b.name, undefined, { numeric: true })
  )
}

/** IP → nombre de interfaz; Windows identifica las interfaces por IP en `route print` y `arp -a`. */
export function interfaceNamesByIp(): Map<string, string> {
  const map = new Map<string, string>()
  for (const [name, addresses = []] of Object.entries(networkInterfaces())) {
    for (const address of addresses) map.set(address.address, name)
  }
  return map
}
