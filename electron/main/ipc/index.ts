import { registerConfigHandlers } from './config'
import { registerDialogHandlers } from './dialog'

/**
 * Punto único de registro de handlers IPC. Cada nuevo dominio (records, tools, etc.)
 * agrega su archivo `ipc/<dominio>.ts` con su propio `register*Handlers()` y se suma acá.
 */
export function registerIpcHandlers(): void {
  registerConfigHandlers()
  registerDialogHandlers()
}
