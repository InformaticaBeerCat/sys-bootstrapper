import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  FileExistsParams,
  MySQLScript,
  MySQLScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../../shared/databases/mysql'
import { IPC_CHANNELS } from '../../../shared/ipcChannels'
import { readConfig } from '../../configStore'
import { getDefaultWorkingDirectory } from '../../paths'
import { readMySQLScripts, writeMySQLScripts } from './store'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDbFolder(dbName: string): string {
  return sanitizeFolderName(dbName.trim() || 'mysql')
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getMySQLBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'databases', 'mysql')
}

async function resolveMySQLBaseDir(): Promise<string> {
  return getMySQLBaseDir(await resolveWorkingDirectory())
}

export function registerMySQLHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.mysql.getAll, () => readMySQLScripts())

  ipcMain.handle(IPC_CHANNELS.mysql.add, async (_event, input: MySQLScriptInput) => {
    const scripts = await readMySQLScripts()
    const script: MySQLScript = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...scripts, script]
    await writeMySQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mysql.update, async (_event, id: string, input: MySQLScriptInput) => {
    const scripts = await readMySQLScripts()
    const next = scripts.map((script) => (script.id === id ? { ...script, ...input } : script))
    await writeMySQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mysql.removeAt, async (_event, id: string) => {
    const scripts = await readMySQLScripts()
    const target = scripts.find((script) => script.id === id)
    if (target) {
      const baseDir = await resolveMySQLBaseDir()
      const targetDir = join(baseDir, getDbFolder(target.dbName))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = scripts.filter((script) => script.id !== id)
    await writeMySQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mysql.getDefaultSaveDir, () => resolveMySQLBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.mysql.saveScriptFile,
    async (_event, params: SaveScriptFileParams): Promise<SaveScriptFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolveMySQLBaseDir())
        const targetDir = join(baseDir, getDbFolder(params.dbName))
        await mkdir(targetDir, { recursive: true })
        const filePath = join(targetDir, params.filename)
        await writeFile(filePath, params.content, 'utf-8')
        return { success: true, filePath }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.mysql.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolveMySQLBaseDir())
    const targetDir = join(baseDir, getDbFolder(params.dbName))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.mysql.openScriptsDir, async () => {
    const dir = await resolveMySQLBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
