import { contextBridge } from 'electron'
import { apacheApi } from './api/apache'
import { configApi } from './api/config'
import { dialogApi } from './api/dialog'

/**
 * API expuesta al renderer, agrupada por dominio (misma estructura que main/ipc).
 * Cada nuevo dominio agrega su `api/<dominio>.ts` y se suma acá.
 */
const api = {
  config: configApi,
  dialog: dialogApi,
  apache: apacheApi
}

contextBridge.exposeInMainWorld('sysBootstrapper', api)

export type SysBootstrapperApi = typeof api
