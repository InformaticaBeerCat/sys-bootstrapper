import { ipcRenderer } from 'electron'
import type {
  ApacheServer,
  ApacheServerInput,
  FileExistsParams,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../shared/apache'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const apacheApi = {
  getAll: (): Promise<ApacheServer[]> => ipcRenderer.invoke(IPC_CHANNELS.apache.getAll),
  add: (input: ApacheServerInput): Promise<ApacheServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.apache.add, input),
  update: (id: string, input: ApacheServerInput): Promise<ApacheServer[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.apache.update, id, input),
  removeAt: (id: string): Promise<ApacheServer[]> => ipcRenderer.invoke(IPC_CHANNELS.apache.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.apache.getDefaultSaveDir),
  saveConfFile: (params: SaveConfFileParams): Promise<SaveConfFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.apache.saveConfFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.apache.fileExists, params),
  openConfigDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.apache.openConfigDir)
}
