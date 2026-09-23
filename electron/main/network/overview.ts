import { getServers } from 'node:dns'
import { hostname, networkInterfaces } from 'node:os'
import { net, session } from 'electron'
import { classifyIpv4, type NetworkOverview, type PrivateIpInfo, type ProxyInfo } from '../../shared/network'
import { describeError } from './exec'
import { collectInterfaces } from './interfaces'
import { collectRoutes, pickDefaultGateway } from './routes'

const PROXY_ENV_VARS = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY']

function readProxyEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const name of PROXY_ENV_VARS) {
    const value = process.env[name] ?? process.env[name.toLowerCase()]
    // Se enmascara la contraseña si la URL del proxy trae credenciales (http://usuario:clave@host).
    if (value) env[name] = value.replace(/\/\/([^:@/]+):[^@/]+@/, '//$1:****@')
  }
  return env
}

async function resolveProxyInfo(): Promise<ProxyInfo> {
  const env = readProxyEnv()
  try {
    // Chromium aplica la config de proxy del sistema (incluidos PAC/WPAD); se consulta para una URL externa cualquiera.
    const rule = await session.defaultSession.resolveProxy('https://example.com')
    return { rule, direct: rule.trim().toUpperCase() === 'DIRECT', env, error: null }
  } catch (error) {
    return { rule: null, direct: false, env, error: describeError(error) }
  }
}

export async function collectOverview(): Promise<NetworkOverview> {
  const [{ routes }, proxy] = await Promise.all([collectRoutes(), resolveProxyInfo()])
  const gateway = pickDefaultGateway(routes)
  const interfaces = await collectInterfaces(gateway.interfaceName)
  return {
    hostname: hostname(),
    platform: process.platform,
    online: net.isOnline(),
    interfaces,
    gateway,
    dnsServers: getServers(),
    proxy,
    collectedAt: new Date().toISOString()
  }
}

export async function resolvePrivateIp(): Promise<PrivateIpInfo> {
  const { routes } = await collectRoutes()
  const gatewayInterface = pickDefaultGateway(routes).interfaceName
  const candidates = Object.entries(networkInterfaces()).flatMap(([name, addresses = []]) =>
    addresses
      .filter((address) => address.family === 'IPv4' && !address.internal)
      .map((address) => ({ name, address: address.address }))
  )
  // Se prioriza la interfaz de la ruta por defecto: con Docker, VMs o VPNs la primera interfaz
  // con IPv4 no siempre es la de la LAN real.
  const pick = candidates.find((candidate) => candidate.name === gatewayInterface) ?? candidates[0]
  if (!pick) return { address: null, interfaceName: null, kind: 'unknown' }
  return { address: pick.address, interfaceName: pick.name, kind: classifyIpv4(pick.address) }
}
