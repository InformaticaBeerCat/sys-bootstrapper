import { contextBridge, ipcRenderer } from 'electron'
import { AppConfig, IPC } from '../shared/config'

const api = {
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke(IPC.configGet),
  getConfigFilePath: (): Promise<string> => ipcRenderer.invoke(IPC.configGetPath),
  setWorkingDirectory: (workingDirectory: string): Promise<AppConfig> =>
    ipcRenderer.invoke(IPC.configSetWorkingDirectory, workingDirectory),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke(IPC.dialogSelectDirectory)
}

contextBridge.exposeInMainWorld('sysBootstrapper', api)

export type SysBootstrapperApi = typeof api
