import {
  serviceForPort,
  socketExposure,
  type ListeningPortsResult,
  type ListeningSocket
} from '../../shared/network'
import { describeError, runCommand } from './exec'

interface RawSocket {
  protocol: 'TCP' | 'UDP'
  address: string
  port: number
  pid: number | null
  process: string | null
  user: string | null
}

const WILDCARD_ADDRESSES = new Set(['*', '0.0.0.0', '::', '::0'])

/** "127.0.0.1:631", "[::1]:5432", "*:80", "127.0.0.53%lo:53" → host + puerto. null si no hay puerto ("*:*"). */
function splitHostPort(value: string): { host: string; port: number } | null {
  const idx = value.lastIndexOf(':')
  if (idx < 0) return null
  const port = Number(value.slice(idx + 1))
  if (!Number.isInteger(port) || port <= 0) return null
  const host = value
    .slice(0, idx)
    .replace(/^\[|\]$/g, '')
    .split('%')[0]
  // Todas las variantes de "cualquier interfaz" (IPv4, IPv6, lsof) se unifican en "*".
  return { host: WILDCARD_ADDRESSES.has(host) ? '*' : host, port }
}

async function darwinSockets(): Promise<RawSocket[]> {
  // Sin -a, lsof combina los -i con OR: TCP en LISTEN + todos los UDP (los conectados se descartan abajo).
  // -F imprime un campo por línea con prefijo: p=pid, c=comando, L=usuario, P=protocolo, n=dirección.
  const output = await runCommand('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN', '-iUDP', '-F', 'pcLPn'], {
    allowExitCode: true
  })
  const sockets: RawSocket[] = []
  let pid: number | null = null
  let command: string | null = null
  let user: string | null = null
  let protocol: RawSocket['protocol'] | null = null

  for (const line of output.split('\n')) {
    const value = line.slice(1)
    switch (line[0]) {
      case 'p':
        pid = Number(value)
        command = null
        user = null
        break
      case 'c':
        command = value
        break
      case 'L':
        user = value
        break
      case 'f':
        protocol = null
        break
      case 'P':
        protocol = value === 'TCP' || value === 'UDP' ? value : null
        break
      case 'n': {
        if (!protocol || value.includes('->')) break
        const endpoint = splitHostPort(value)
        if (endpoint) sockets.push({ protocol, address: endpoint.host, port: endpoint.port, pid, process: command, user })
        break
      }
    }
  }
  return sockets
}

async function linuxSockets(): Promise<RawSocket[]> {
  // Columnas: Netid State Recv-Q Send-Q Local Peer Process. Sin root, "Process" solo trae los del usuario actual.
  const output = await runCommand('ss', ['-tulnp'])
  const sockets: RawSocket[] = []
  for (const line of output.split('\n')) {
    const cols = line.trim().split(/\s+/)
    const protocol = cols[0] === 'tcp' ? 'TCP' : cols[0] === 'udp' ? 'UDP' : null
    const endpoint = protocol && cols.length >= 5 ? splitHostPort(cols[4]) : null
    if (!protocol || !endpoint) continue
    // users:(("nginx",pid=1201,fd=6),("nginx",pid=1200,fd=6)) → un socket compartido por varios procesos.
    const owners = [...line.matchAll(/\("([^"]+)",pid=(\d+)/g)]
    if (owners.length === 0) {
      sockets.push({ protocol, address: endpoint.host, port: endpoint.port, pid: null, process: null, user: null })
    }
    for (const owner of owners) {
      sockets.push({ protocol, address: endpoint.host, port: endpoint.port, pid: Number(owner[2]), process: owner[1], user: null })
    }
  }
  return sockets
}

async function windowsSockets(): Promise<RawSocket[]> {
  const [netstat, tasklist] = await Promise.all([
    runCommand('netstat', ['-ano']),
    runCommand('tasklist', ['/fo', 'csv', '/nh']).catch(() => '')
  ])

  const processNames = new Map<number, string>()
  for (const line of tasklist.split(/\r?\n/)) {
    const match = /^"([^"]*)","(\d+)"/.exec(line)
    if (match) processNames.set(Number(match[2]), match[1])
  }

  const sockets: RawSocket[] = []
  for (const line of netstat.split(/\r?\n/)) {
    const cols = line.trim().split(/\s+/)
    const protocol = cols[0] === 'TCP' ? 'TCP' : cols[0] === 'UDP' ? 'UDP' : null
    if (!protocol || cols.length < 4) continue
    const foreign = cols[2]
    // La columna de estado ("LISTENING") viene traducida según el idioma de Windows, así que la escucha
    // se detecta por la dirección remota vacía: 0.0.0.0:0 / [::]:0 en TCP y *:* en UDP.
    const listening = protocol === 'TCP' ? /^(0\.0\.0\.0|\[::\]):0$/.test(foreign) : foreign === '*:*'
    const endpoint = listening ? splitHostPort(cols[1]) : null
    if (!endpoint) continue
    const pid = Number(cols[cols.length - 1])
    sockets.push({
      protocol,
      address: endpoint.host,
      port: endpoint.port,
      pid: Number.isInteger(pid) ? pid : null,
      process: processNames.get(pid) ?? null,
      user: null
    })
  }
  return sockets
}

/** Une IPv4/IPv6 del mismo servicio y los workers que comparten socket (httpd, nginx...) en una sola fila. */
function groupSockets(raw: RawSocket[]): ListeningSocket[] {
  const groups = new Map<string, ListeningSocket>()
  for (const socket of raw) {
    const key = `${socket.protocol}|${socket.address}|${socket.port}|${socket.process ?? ''}`
    const existing = groups.get(key)
    if (existing) {
      if (socket.pid !== null && !existing.pids.includes(socket.pid)) existing.pids.push(socket.pid)
      continue
    }
    groups.set(key, {
      protocol: socket.protocol,
      address: socket.address,
      port: socket.port,
      exposure: socketExposure(socket.address),
      process: socket.process,
      pids: socket.pid !== null ? [socket.pid] : [],
      user: socket.user,
      service: serviceForPort(socket.port)
    })
  }
  return [...groups.values()].sort(
    (a, b) => a.protocol.localeCompare(b.protocol) || a.port - b.port || a.address.localeCompare(b.address)
  )
}

export async function collectListeningPorts(): Promise<ListeningPortsResult> {
  // En Windows netstat -ano ve todos los PIDs sin elevar; en macOS/Linux sin root faltan los de otros usuarios.
  const partial = process.platform !== 'win32' && process.getuid?.() !== 0
  try {
    const raw =
      process.platform === 'win32'
        ? await windowsSockets()
        : process.platform === 'linux'
          ? await linuxSockets()
          : await darwinSockets()
    return { sockets: groupSockets(raw), partial, error: null }
  } catch (error) {
    return { sockets: [], partial, error: describeError(error) }
  }
}
