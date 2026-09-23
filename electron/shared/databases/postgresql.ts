export const POSTGRESQL_CHANNELS = {
  getAll: 'postgresql:get-all',
  add: 'postgresql:add',
  update: 'postgresql:update',
  removeAt: 'postgresql:remove',
  getDefaultSaveDir: 'postgresql:get-default-save-dir',
  saveScriptFile: 'postgresql:save-script-file',
  fileExists: 'postgresql:file-exists',
  openScriptsDir: 'postgresql:open-scripts-dir'
} as const

export type PostgreSQLPrivilegePreset = 'personalizado' | 'produccion' | 'desarrollo' | 'solo_lectura'

export interface PostgreSQLScriptInput {
  dbName: string
  userName: string
  userPassword: string
  privileges: string
  preset: PostgreSQLPrivilegePreset
  encoding: string
  allowedHost: string
}

export interface PostgreSQLScript extends PostgreSQLScriptInput {
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
