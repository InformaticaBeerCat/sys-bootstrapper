import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  ApacheServer,
  ApacheServerInput,
  FileExistsParams,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../shared/apache'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { readApacheServers, writeApacheServers } from '../apacheStore'
import { readConfig } from '../configStore'
import { getDefaultWorkingDirectory } from '../paths'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDomainFolder(domains: string): string {
  const firstDomain = domains.split(',')[0]?.trim() || 'apache'
  return sanitizeFolderName(firstDomain)
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getApacheBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'http-configs', 'apache')
}

async function resolveApacheBaseDir(): Promise<string> {
  return getApacheBaseDir(await resolveWorkingDirectory())
}

export function registerApacheHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.apache.getAll, () => readApacheServers())

  ipcMain.handle(IPC_CHANNELS.apache.add, async (_event, input: ApacheServerInput) => {
    const servers = await readApacheServers()
    const server: ApacheServer = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...servers, server]
    await writeApacheServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.apache.update, async (_event, id: string, input: ApacheServerInput) => {
    const servers = await readApacheServers()
    const next = servers.map((server) => (server.id === id ? { ...server, ...input } : server))
    await writeApacheServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.apache.removeAt, async (_event, id: string) => {
    const servers = await readApacheServers()
    const target = servers.find((server) => server.id === id)
    if (target) {
      const baseDir = await resolveApacheBaseDir()
      const targetDir = join(baseDir, getDomainFolder(target.domains))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = servers.filter((server) => server.id !== id)
    await writeApacheServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.apache.getDefaultSaveDir, () => resolveApacheBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.apache.saveConfFile,
    async (_event, params: SaveConfFileParams): Promise<SaveConfFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolveApacheBaseDir())
        const targetDir = join(baseDir, getDomainFolder(params.domains))
        await mkdir(targetDir, { recursive: true })
        const filePath = join(targetDir, params.filename)
        await writeFile(filePath, params.content, 'utf-8')
        return { success: true, filePath }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.apache.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolveApacheBaseDir())
    const targetDir = join(baseDir, getDomainFolder(params.domains))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.apache.openConfigDir, async () => {
    const dir = await resolveApacheBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
