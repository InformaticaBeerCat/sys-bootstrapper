import { ipcRenderer } from 'electron'
import type {
  FileExistsParams,
  MongoDBScript,
  MongoDBScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../shared/databases/mongodb'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export const mongodbApi = {
  getAll: (): Promise<MongoDBScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mongodb.getAll),
  add: (input: MongoDBScriptInput): Promise<MongoDBScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mongodb.add, input),
  update: (id: string, input: MongoDBScriptInput): Promise<MongoDBScript[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.mongodb.update, id, input),
  removeAt: (id: string): Promise<MongoDBScript[]> => ipcRenderer.invoke(IPC_CHANNELS.mongodb.removeAt, id),
  getDefaultSaveDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.mongodb.getDefaultSaveDir),
  saveScriptFile: (params: SaveScriptFileParams): Promise<SaveScriptFileResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.mongodb.saveScriptFile, params),
  fileExists: (params: FileExistsParams): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.mongodb.fileExists, params),
  openScriptsDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.mongodb.openScriptsDir)
}
