import { execFile } from 'node:child_process'

const DEFAULT_TIMEOUT_MS = 8000
const MAX_BUFFER = 8 * 1024 * 1024

function buildEnv(): NodeJS.ProcessEnv {
  if (process.platform === 'win32') return process.env
  // Una app lanzada desde el Dock o el menú de escritorio no siempre hereda /usr/sbin y /sbin en el PATH,
  // que es donde viven netstat, lsof, ifconfig, networksetup o ss según la distro.
  const path = [process.env.PATH, '/usr/sbin', '/sbin', '/usr/bin', '/bin'].filter(Boolean).join(':')
  // LC_ALL=C deja la salida en inglés y con formato estable, sin importar el idioma del SO.
  return { ...process.env, PATH: path, LC_ALL: 'C', LANG: 'C' }
}

interface RunOptions {
  timeoutMs?: number
  /** Devuelve stdout aunque el comando termine con código distinto de 0 (lsof sale con 1 si un filtro no encuentra nada). */
  allowExitCode?: boolean
}

export function runCommand(file: string, args: string[], options: RunOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      file,
      args,
      {
        timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        maxBuffer: MAX_BUFFER,
        windowsHide: true,
        env: buildEnv(),
        encoding: 'utf8'
      },
      (error, stdout) => {
        // error.code numérico = el comando corrió y salió con ese código; string (ENOENT...) = no se pudo ejecutar.
        if (error && !(options.allowExitCode && typeof error.code === 'number')) reject(error)
        else resolve(stdout)
      }
    )
  })
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
