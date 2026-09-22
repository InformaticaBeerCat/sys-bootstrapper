import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { is } from './env'
import { IPC } from '../shared/config'
import { readConfig, writeConfig } from './configStore'
import { getConfigFilePath } from './paths'

const appIconPath = is.dev
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'icon.png')

function createMainWindow(): void {
  const win = new BrowserWindow({
    width: 1040,
    height: 680,
    minWidth: 760,
    minHeight: 520,
    show: false,
    backgroundColor: '#141414',
    autoHideMenuBar: true,
    icon: appIconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      zoomFactor: 1.3
    }
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC.configGet, () => readConfig())

  ipcMain.handle(IPC.configGetPath, () => getConfigFilePath())

  ipcMain.handle(IPC.configSetWorkingDirectory, (_event, workingDirectory: string) =>
    writeConfig({ workingDirectory })
  )

  ipcMain.handle(IPC.dialogSelectDirectory, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = { properties: ['openDirectory', 'createDirectory'] }
    const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
