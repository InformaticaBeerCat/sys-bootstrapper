import { ipcRenderer } from 'electron'
import type {
  FileExistsParams,
  MySQLScript,
  MySQLScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../shared/databases/mysql'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const mysqlApi = {
  getAll: (): Promise<MySQLScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mysql.getAll),
  add: (input: MySQLScriptInput): Promise<MySQLScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mysql.add, input),
  update: (id: string, input: MySQLScriptInput): Promise<MySQLScript[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.mysql.update, id, input),
  removeAt: (id: string): Promise<MySQLScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mysql.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.mysql.getDefaultSaveDir),
  saveScriptFile: (params: SaveScriptFileParams): Promise<SaveScriptFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.mysql.saveScriptFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.mysql.fileExists, params),
  openScriptsDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.mysql.openScriptsDir)
}
