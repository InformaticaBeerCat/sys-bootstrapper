import { ipcRenderer } from 'electron'
import type {
  DnsLookupParams,
  DnsLookupResult,
  ListeningPortsResult,
  NeighborsResult,
  NetworkOverview,
  NetworkReport,
  PortCheckParams,
  PortCheckResult,
  PrivateIpInfo,
  PublicIpDetails,
  PublicIpInfo,
  RoutesResult,
  SaveNetworkReportResult,
  TlsInspectParams,
  TlsInspectResult
} from '../../shared/network'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

const channels = IPC_CHANNELS.network

export const networkApi = {
  getPrivateIp: (): Promise<PrivateIpInfo> => ipcRenderer.invoke(channels.getPrivateIp),
  getPublicIp: (): Promise<PublicIpInfo> => ipcRenderer.invoke(channels.getPublicIp),
  getOverview: (): Promise<NetworkOverview> => ipcRenderer.invoke(channels.getOverview),
  getPublicIpDetails: (): Promise<PublicIpDetails> => ipcRenderer.invoke(channels.getPublicIpDetails),
  getRoutes: (): Promise<RoutesResult> => ipcRenderer.invoke(channels.getRoutes),
  getNeighbors: (): Promise<NeighborsResult> => ipcRenderer.invoke(channels.getNeighbors),
  getListeningPorts: (): Promise<ListeningPortsResult> => ipcRenderer.invoke(channels.getListeningPorts),
  dnsLookup: (params: DnsLookupParams): Promise<DnsLookupResult> => ipcRenderer.invoke(channels.dnsLookup, params),
  checkPorts: (params: PortCheckParams): Promise<PortCheckResult> => ipcRenderer.invoke(channels.checkPorts, params),
  inspectTls: (params: TlsInspectParams): Promise<TlsInspectResult> => ipcRenderer.invoke(channels.inspectTls, params),
  getReport: (): Promise<NetworkReport> => ipcRenderer.invoke(channels.getReport),
  saveReport: (): Promise<SaveNetworkReportResult> => ipcRenderer.invoke(channels.saveReport)
}
