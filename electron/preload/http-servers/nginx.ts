import { ipcRenderer } from 'electron'
import type {
  FileExistsParams,
  NginxServer,
  NginxServerInput,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../shared/http-servers/nginx'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const nginxApi = {
  getAll: (): Promise<NginxServer[]> => ipcRenderer.invoke(IPC_CHANNELS.nginx.getAll),
  add: (input: NginxServerInput): Promise<NginxServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.nginx.add, input),
  update: (id: string, input: NginxServerInput): Promise<NginxServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.nginx.update, id, input),
  removeAt: (id: string): Promise<NginxServer[]> => ipcRenderer.invoke(IPC_CHANNELS.nginx.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.nginx.getDefaultSaveDir),
  saveConfFile: (params: SaveConfFileParams): Promise<SaveConfFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.nginx.saveConfFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.nginx.fileExists, params),
  openConfigDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.nginx.openConfigDir)
}
