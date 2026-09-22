export const APACHE_CHANNELS = {
  getAll: 'apache:get-all',
  add: 'apache:add',
  update: 'apache:update',
  removeAt: 'apache:remove',
  getDefaultSaveDir: 'apache:get-default-save-dir',
  saveConfFile: 'apache:save-conf-file',
  fileExists: 'apache:file-exists',
  openConfigDir: 'apache:open-config-dir'
} as const

export type ApacheSSLMode = 'certbot' | 'snakeoil' | 'custom'

export interface ApacheServerInput {
  domains: string
  http: boolean
  https: boolean
  path: string
  ssl: ApacheSSLMode
  sslCustomCert?: string
  sslCustomKey?: string
  redirect: boolean
  isProxy: boolean
  proxyTarget: string
}

export interface ApacheServer extends ApacheServerInput {
  id: string
  createdAt: string
}

export interface SaveConfFileParams {
  filename: string
  content: string
  saveDir: string | null
  domains: string
}

export interface FileExistsParams {
  filename: string
  saveDir: string | null
  domains: string
}

export interface SaveConfFileResult {
  success: boolean
  filePath?: string
  error?: string
}
