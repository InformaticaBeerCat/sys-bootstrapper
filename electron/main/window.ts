import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { is } from './env'

export const appIconPath = is.dev
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'icon.png')

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    title: 'SYS-BOOTSTRAPPER',
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
      zoomFactor: 1.1
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

  return win
}
