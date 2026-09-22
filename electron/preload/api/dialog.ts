import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const dialogApi = {
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke(IPC_CHANNELS.dialog.selectDirectory)
}
