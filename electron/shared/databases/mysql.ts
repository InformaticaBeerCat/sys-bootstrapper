export const MYSQL_CHANNELS = {
  getAll: 'mysql:get-all',
  add: 'mysql:add',
  update: 'mysql:update',
  removeAt: 'mysql:remove',
  getDefaultSaveDir: 'mysql:get-default-save-dir',
  saveScriptFile: 'mysql:save-script-file',
  fileExists: 'mysql:file-exists',
  openScriptsDir: 'mysql:open-scripts-dir'
} as const

export type MySQLHostPreset = 'localhost' | '%' | 'custom'
export type MySQLPrivilegePreset = 'personalizado' | 'produccion' | 'desarrollo' | 'solo_lectura'

export interface MySQLScriptInput {
  dbName: string
  userName: string
  userPassword: string
  privileges: string
  host: string
  preset: MySQLPrivilegePreset
  charset: string
}

export interface MySQLScript extends MySQLScriptInput {
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
