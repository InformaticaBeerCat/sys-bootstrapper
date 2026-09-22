import { homedir } from 'node:os'
import { join } from 'node:path'

const APP_FOLDER_NAME = 'sys-bootstrapper'

/**
 * Resuelve la carpeta de datos de la app, oculta por convención del SO en los tres casos:
 * - Windows: %APPDATA% (Roaming) no se muestra en el explorador por defecto.
 * - macOS: ~/Library es una carpeta oculta.
 * - Linux: ~/.config sigue la convención XDG y el prefijo "." la oculta.
 */

export function getAppDataDir(): string {
  switch (process.platform) {
    case 'win32':
      return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), APP_FOLDER_NAME)
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', APP_FOLDER_NAME)
    default:
      return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), APP_FOLDER_NAME)
  }
}

export function getConfigFilePath(): string {
  return join(getAppDataDir(), 'config.json')
}

/**
 * Carpeta de trabajo por defecto para archivos generados (visible, no oculta),
 * usada cuando el usuario aún no eligió una en Configuración.
 */
export function getDefaultWorkingDirectory(): string {
  const home = homedir()
  return process.platform === 'win32'
    ? join(home, 'Documents', APP_FOLDER_NAME)
    : join(home, APP_FOLDER_NAME)
}
