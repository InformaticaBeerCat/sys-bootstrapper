/**
 * Canales IPC agrupados por dominio. Cada nuevo dominio (records, tools, etc.)
 * agrega su propio bloque acá en vez de mezclarse con los demás.
 */
export const IPC_CHANNELS = {
  config: {
    get: 'config:get',
    getPath: 'config:get-path',
    setWorkingDirectory: 'config:set-working-directory'
  },
  dialog: {
    selectDirectory: 'dialog:select-directory'
  }
} as const
