export const NGINX_CHANNELS = {
  getAll: 'nginx:get-all',
  add: 'nginx:add',
  update: 'nginx:update',
  removeAt: 'nginx:remove',
  getDefaultSaveDir: 'nginx:get-default-save-dir',
  saveConfFile: 'nginx:save-conf-file',
  fileExists: 'nginx:file-exists',
  openConfigDir: 'nginx:open-config-dir'
} as const

export type NginxSSLMode = 'certbot' | 'snakeoil' | 'custom'

export interface NginxServerInput {
  domains: string
  http: boolean
  https: boolean
  path: string
  ssl: NginxSSLMode
  sslCustomCert?: string
  sslCustomKey?: string
  redirect: boolean
  isProxy: boolean
  proxyTarget: string
}

export interface NginxServer extends NginxServerInput {
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
