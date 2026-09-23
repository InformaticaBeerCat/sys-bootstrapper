import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { readConfig, writeConfig } from '../configStore'
import { getConfigFilePath, getDefaultWorkingDirectory } from '../paths'

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.config.get, () => readConfig())

  ipcMain.handle(IPC_CHANNELS.config.getPath, () => getConfigFilePath())

  ipcMain.handle(IPC_CHANNELS.config.getDefaultWorkingDirectory, () => getDefaultWorkingDirectory())

  ipcMain.handle(IPC_CHANNELS.config.setWorkingDirectory, (_event, workingDirectory: string) =>
    writeConfig({ workingDirectory })
  )
}
