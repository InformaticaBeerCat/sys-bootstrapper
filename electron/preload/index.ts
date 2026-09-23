import { contextBridge } from 'electron'
import { mongodbApi } from './databases/mongodb'
import { mysqlApi } from './databases/mysql'
import { postgresqlApi } from './databases/postgresql'
import { apacheApi } from './http-servers/apache'
import { caddyApi } from './http-servers/caddy'
import { nginxApi } from './http-servers/nginx'
import { configApi } from './api/config'
import { dialogApi } from './api/dialog'

/**
 * API expuesta al renderer, agrupada por dominio (misma estructura que main/).
 * Los dominios de app (config, dialog) viven en `api/<dominio>.ts`. Cada tool vive en
 * `preload/<categoría>/<tool>.ts` (espejo de `main/<categoría>/<tool>/`) y se suma acá.
 * El objeto expuesto en window.sysBootstrapper se mantiene plano (un key por tool),
 * los nombres de tool ya son únicos entre categorías.
 */
const api = {
  config: configApi,
  dialog: dialogApi,
  apache: apacheApi,
  nginx: nginxApi,
  caddy: caddyApi,
  mysql: mysqlApi,
  postgresql: postgresqlApi,
  mongodb: mongodbApi
}

contextBridge.exposeInMainWorld('sysBootstrapper', api)

export type SysBootstrapperApi = typeof api
