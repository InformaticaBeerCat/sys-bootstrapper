import { networkInterfaces } from 'node:os'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { classifyIpv4, type PrivateIpInfo, type PublicIpInfo } from '../../shared/network'

const FETCH_TIMEOUT_MS = 5000

async function fetchFromIpify(): Promise<string> {
  const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`api.ipify.org: HTTP ${res.status}`)
  const data = (await res.json()) as { ip: string }
  return data.ip
}

async function fetchFromIcanhazip(): Promise<string> {
  // Se usa el subdominio ipv4. explícito: en redes dual-stack, icanhazip.com a secas
  // puede devolver la IPv6 del equipo, que no es comparable con la IP privada (siempre IPv4).
  const res = await fetch('https://ipv4.icanhazip.com', { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`icanhazip.com: HTTP ${res.status}`)
  const text = await res.text()
  return text.trim()
}

// Se intenta con varios proveedores gratuitos por si alguno está caído o bloqueado en la red del usuario.
const PUBLIC_IP_PROVIDERS = [fetchFromIpify, fetchFromIcanhazip]

function resolvePrivateIp(): PrivateIpInfo {
  const interfaces = networkInterfaces()
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) {
        return { address: address.address, interfaceName: name, kind: classifyIpv4(address.address) }
      }
    }
  }
  return { address: null, interfaceName: null, kind: 'unknown' }
}

async function resolvePublicIp(): Promise<PublicIpInfo> {
  let lastError: string | null = null
  for (const fetchIp of PUBLIC_IP_PROVIDERS) {
    try {
      const address = await fetchIp()
      if (address) return { address, error: null, kind: classifyIpv4(address) }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }
  return { address: null, error: lastError, kind: 'unknown' }
}

export function registerNetworkHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.network.getPrivateIp, () => resolvePrivateIp())
  ipcMain.handle(IPC_CHANNELS.network.getPublicIp, () => resolvePublicIp())
}
