import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  FileExistsParams,
  PostgreSQLScript,
  PostgreSQLScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../../shared/databases/postgresql'
import { IPC_CHANNELS } from '../../../shared/ipcChannels'
import { readConfig } from '../../configStore'
import { getDefaultWorkingDirectory } from '../../paths'
import { readPostgreSQLScripts, writePostgreSQLScripts } from './store'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDbFolder(dbName: string): string {
  return sanitizeFolderName(dbName.trim() || 'postgresql')
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getPostgreSQLBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'databases', 'postgresql')
}

async function resolvePostgreSQLBaseDir(): Promise<string> {
  return getPostgreSQLBaseDir(await resolveWorkingDirectory())
}

export function registerPostgreSQLHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.postgresql.getAll, () => readPostgreSQLScripts())

  ipcMain.handle(IPC_CHANNELS.postgresql.add, async (_event, input: PostgreSQLScriptInput) => {
    const scripts = await readPostgreSQLScripts()
    const script: PostgreSQLScript = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...scripts, script]
    await writePostgreSQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.postgresql.update, async (_event, id: string, input: PostgreSQLScriptInput) => {
    const scripts = await readPostgreSQLScripts()
    const next = scripts.map((script) => (script.id === id ? { ...script, ...input } : script))
    await writePostgreSQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.postgresql.removeAt, async (_event, id: string) => {
    const scripts = await readPostgreSQLScripts()
    const target = scripts.find((script) => script.id === id)
    if (target) {
      const baseDir = await resolvePostgreSQLBaseDir()
      const targetDir = join(baseDir, getDbFolder(target.dbName))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = scripts.filter((script) => script.id !== id)
    await writePostgreSQLScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.postgresql.getDefaultSaveDir, () => resolvePostgreSQLBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.postgresql.saveScriptFile,
    async (_event, params: SaveScriptFileParams): Promise<SaveScriptFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolvePostgreSQLBaseDir())
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

  ipcMain.handle(IPC_CHANNELS.postgresql.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolvePostgreSQLBaseDir())
    const targetDir = join(baseDir, getDbFolder(params.dbName))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.postgresql.openScriptsDir, async () => {
    const dir = await resolvePostgreSQLBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
