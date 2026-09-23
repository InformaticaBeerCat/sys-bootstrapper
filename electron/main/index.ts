import { app, BrowserWindow } from 'electron'
import { is } from './env'
import { registerIpcHandlers } from './ipc'
import { createMainWindow, macDockIconPath } from './window'

// Debe fijarse antes de 'ready' para que el menú/Dock de macOS lo tomen.
app.setName('SYS-BOOTSTRAPPER')

app.whenReady().then(() => {
  // En dev macOS no empaqueta un .app con Info.plist, así que el Dock
  // muestra el icono por defecto de Electron salvo que se fije a mano.
  if (is.dev && process.platform === 'darwin') {
    app.dock?.setIcon(macDockIconPath)
  }

  registerIpcHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
