export const CADDY_CHANNELS = {
  getAll: 'caddy:get-all',
  add: 'caddy:add',
  update: 'caddy:update',
  removeAt: 'caddy:remove',
  getDefaultSaveDir: 'caddy:get-default-save-dir',
  saveConfFile: 'caddy:save-conf-file',
  fileExists: 'caddy:file-exists',
  openConfigDir: 'caddy:open-config-dir'
} as const

export type CaddyMode = 'static' | 'proxy'

/**
 * Caddy no separa HTTP/HTTPS ni pide certificados manuales: por defecto gestiona
 * TLS automáticamente (Let's Encrypt) para cualquier dominio declarado.
 * - auto: HTTPS automático (comportamiento por defecto de Caddy)
 * - internal: certificado autofirmado de la CA interna, útil para dominios locales/dev
 * - custom: certificado y llave provistos manualmente
 * - off: fuerza el sitio a texto plano por HTTP (prefijo http://)
 */
export type CaddyTlsMode = 'auto' | 'internal' | 'custom' | 'off'

export interface CaddyServerInput {
  domains: string
  mode: CaddyMode
  path: string
  proxyTarget: string
  tls: CaddyTlsMode
  tlsCustomCert?: string
  tlsCustomKey?: string
  encodeGzip: boolean
}

export interface CaddyServer extends CaddyServerInput {
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
