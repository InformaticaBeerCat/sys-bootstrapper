import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  FileExistsParams,
  MongoDBScript,
  MongoDBScriptInput,
  SaveScriptFileParams,
  SaveScriptFileResult
} from '../../../shared/databases/mongodb'
import { IPC_CHANNELS } from '../../../shared/ipcChannels'
import { readConfig } from '../../configStore'
import { getDefaultWorkingDirectory } from '../../paths'
import { readMongoDBScripts, writeMongoDBScripts } from './store'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDbFolder(dbName: string): string {
  return sanitizeFolderName(dbName.trim() || 'mongodb')
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getMongoDBBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'databases', 'mongodb')
}

async function resolveMongoDBBaseDir(): Promise<string> {
  return getMongoDBBaseDir(await resolveWorkingDirectory())
}

export function registerMongoDBHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.mongodb.getAll, () => readMongoDBScripts())

  ipcMain.handle(IPC_CHANNELS.mongodb.add, async (_event, input: MongoDBScriptInput) => {
    const scripts = await readMongoDBScripts()
    const script: MongoDBScript = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...scripts, script]
    await writeMongoDBScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mongodb.update, async (_event, id: string, input: MongoDBScriptInput) => {
    const scripts = await readMongoDBScripts()
    const next = scripts.map((script) => (script.id === id ? { ...script, ...input } : script))
    await writeMongoDBScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mongodb.removeAt, async (_event, id: string) => {
    const scripts = await readMongoDBScripts()
    const target = scripts.find((script) => script.id === id)
    if (target) {
      const baseDir = await resolveMongoDBBaseDir()
      const targetDir = join(baseDir, getDbFolder(target.dbName))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = scripts.filter((script) => script.id !== id)
    await writeMongoDBScripts(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.mongodb.getDefaultSaveDir, () => resolveMongoDBBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.mongodb.saveScriptFile,
    async (_event, params: SaveScriptFileParams): Promise<SaveScriptFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolveMongoDBBaseDir())
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

  ipcMain.handle(IPC_CHANNELS.mongodb.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolveMongoDBBaseDir())
    const targetDir = join(baseDir, getDbFolder(params.dbName))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.mongodb.openScriptsDir, async () => {
    const dir = await resolveMongoDBBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
