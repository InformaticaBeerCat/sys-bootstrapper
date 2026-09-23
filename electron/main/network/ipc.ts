import { ipcMain } from 'electron'
import type { DnsLookupParams, PortCheckParams, TlsInspectParams } from '../../shared/network'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { checkPorts, dnsLookup, inspectTls } from './diagnostics'
import { collectOverview, resolvePrivateIp } from './overview'
import { collectListeningPorts } from './ports'
import { resolvePublicIp, resolvePublicIpDetails } from './publicIp'
import { buildReport, saveReport } from './report'
import { collectNeighbors, collectRoutes } from './routes'

export function registerNetworkHandlers(): void {
  const channels = IPC_CHANNELS.network
  ipcMain.handle(channels.getPrivateIp, () => resolvePrivateIp())
  ipcMain.handle(channels.getPublicIp, () => resolvePublicIp())
  ipcMain.handle(channels.getOverview, () => collectOverview())
  ipcMain.handle(channels.getPublicIpDetails, () => resolvePublicIpDetails())
  ipcMain.handle(channels.getRoutes, () => collectRoutes())
  ipcMain.handle(channels.getNeighbors, () => collectNeighbors())
  ipcMain.handle(channels.getListeningPorts, () => collectListeningPorts())
  ipcMain.handle(channels.dnsLookup, (_event, params: DnsLookupParams) => dnsLookup(params))
  ipcMain.handle(channels.checkPorts, (_event, params: PortCheckParams) => checkPorts(params))
  ipcMain.handle(channels.inspectTls, (_event, params: TlsInspectParams) => inspectTls(params))
  ipcMain.handle(channels.getReport, () => buildReport())
  ipcMain.handle(channels.saveReport, () => saveReport())
}
