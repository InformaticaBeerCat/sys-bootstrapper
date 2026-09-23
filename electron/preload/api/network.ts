import { ipcRenderer } from 'electron'
import type { PrivateIpInfo, PublicIpInfo } from '../../shared/network'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const networkApi = {
  getPrivateIp: (): Promise<PrivateIpInfo> => ipcRenderer.invoke(IPC_CHANNELS.network.getPrivateIp),
  getPublicIp: (): Promise<PublicIpInfo> => ipcRenderer.invoke(IPC_CHANNELS.network.getPublicIp)
}
