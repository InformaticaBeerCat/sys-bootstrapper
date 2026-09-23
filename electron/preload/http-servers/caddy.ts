import { ipcRenderer } from 'electron'
import type {
  CaddyServer,
  CaddyServerInput,
  FileExistsParams,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../shared/http-servers/caddy'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const caddyApi = {
  getAll: (): Promise<CaddyServer[]> => ipcRenderer.invoke(IPC_CHANNELS.caddy.getAll),
  add: (input: CaddyServerInput): Promise<CaddyServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.caddy.add, input),
  update: (id: string, input: CaddyServerInput): Promise<CaddyServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.caddy.update, id, input),
  removeAt: (id: string): Promise<CaddyServer[]> => ipcRenderer.invoke(IPC_CHANNELS.caddy.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.caddy.getDefaultSaveDir),
  saveConfFile: (params: SaveConfFileParams): Promise<SaveConfFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.caddy.saveConfFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.caddy.fileExists, params),
  openConfigDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.caddy.openConfigDir)
}
