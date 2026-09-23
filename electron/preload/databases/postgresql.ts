import { ipcRenderer } from 'electron'
import type {
  FileExistsParams,
  PostgreSQLScript,
  PostgreSQLScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../shared/databases/postgresql'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const postgresqlApi = {
  getAll: (): Promise<PostgreSQLScript[]> => ipcRenderer.invoke(IPC_CHANNELS.postgresql.getAll),
  add: (input: PostgreSQLScriptInput): Promise<PostgreSQLScript[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.postgresql.add, input),
  update: (id: string, input: PostgreSQLScriptInput): Promise<PostgreSQLScript[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.postgresql.update, id, input),
  removeAt: (id: string): Promise<PostgreSQLScript[]> => ipcRenderer.invoke(IPC_CHANNELS.postgresql.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.postgresql.getDefaultSaveDir),
  saveScriptFile: (params: SaveScriptFileParams): Promise<SaveScriptFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.postgresql.saveScriptFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.postgresql.fileExists, params),
  openScriptsDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.postgresql.openScriptsDir)
}
