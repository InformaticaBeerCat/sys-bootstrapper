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
  },
  apache: {
    getAll: 'apache:get-all',
    add: 'apache:add',
    update: 'apache:update',
    removeAt: 'apache:remove',
    getDefaultSaveDir: 'apache:get-default-save-dir',
    saveConfFile: 'apache:save-conf-file',
    fileExists: 'apache:file-exists',
    openConfigDir: 'apache:open-config-dir'
  }
} as const
