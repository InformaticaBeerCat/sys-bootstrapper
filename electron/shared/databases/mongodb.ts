export const MONGODB_CHANNELS = {
  getAll: 'mongodb:get-all',
  add: 'mongodb:add',
  update: 'mongodb:update',
  removeAt: 'mongodb:remove',
  getDefaultSaveDir: 'mongodb:get-default-save-dir',
  saveScriptFile: 'mongodb:save-script-file',
  fileExists: 'mongodb:file-exists',
  openScriptsDir: 'mongodb:open-scripts-dir'
} as const

export type MongoDBRolePreset = 'personalizado' | 'produccion' | 'desarrollo' | 'solo_lectura'

export interface MongoDBScriptInput {
  dbName: string
  userName: string
  userPassword: string
  preset: MongoDBRolePreset
  roles: string
  authDb: string
  bindIp: string
  createInitialCollection: boolean
}

export interface MongoDBScript extends MongoDBScriptInput {
  id: string
  createdAt: string
}

export interface SaveScriptFileParams {
  filename: string
  content: string
  saveDir: string | null
  dbName: string
}

export interface FileExistsParams {
  filename: string
  saveDir: string | null
  dbName: string
}

export interface SaveScriptFileResult {
  success: boolean
  filePath?: string
  error?: string
}
