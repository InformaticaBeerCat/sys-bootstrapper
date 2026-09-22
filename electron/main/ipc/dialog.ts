import { BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'

export function registerDialogHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.dialog.selectDirectory, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = { properties: ['openDirectory', 'createDirectory'] }
    const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}
