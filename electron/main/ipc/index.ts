import { registerMySQLHandlers } from '../databases/mysql/ipc'
import { registerPostgreSQLHandlers } from '../databases/postgresql/ipc'
import { registerApacheHandlers } from '../http-servers/apache/ipc'
import { registerCaddyHandlers } from '../http-servers/caddy/ipc'
import { registerNginxHandlers } from '../http-servers/nginx/ipc'
import { registerConfigHandlers } from './config'
import { registerDialogHandlers } from './dialog'

/**
 * Punto único de registro de handlers IPC. Los dominios de app (config, dialog)
 * viven en `ipc/<dominio>.ts`. Cada tool (servidor HTTP, base de datos, etc.) vive en
 * `main/<categoría>/<tool>/ipc.ts` con su propio `register*Handlers()` y se suma acá,
 * para no mezclar infra de app con lógica específica de cada herramienta.
 */
export function registerIpcHandlers(): void {
  registerConfigHandlers()
  registerDialogHandlers()
  registerApacheHandlers()
  registerNginxHandlers()
  registerCaddyHandlers()
  registerMySQLHandlers()
  registerPostgreSQLHandlers()
}
