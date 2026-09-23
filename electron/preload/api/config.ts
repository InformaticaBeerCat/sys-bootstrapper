import { ipcRenderer } from 'electron'
import type { AppConfig } from '../../shared/config'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const configApi = {
  get: (): Promise<AppConfig> => ipcRenderer.invoke(IPC_CHANNELS.config.get),
  getPath: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.config.getPath),
  getDefaultWorkingDirectory: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.config.getDefaultWorkingDirectory),
  setWorkingDirectory: (workingDirectory: string): Promise<AppConfig> =>
    ipcRenderer.invoke(IPC_CHANNELS.config.setWorkingDirectory, workingDirectory)
}
