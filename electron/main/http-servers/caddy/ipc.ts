import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  CaddyServer,
  CaddyServerInput,
  FileExistsParams,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../../shared/http-servers/caddy'
import { IPC_CHANNELS } from '../../../shared/ipcChannels'
import { readCaddyServers, writeCaddyServers } from './store'
import { readConfig } from '../../configStore'
import { getDefaultWorkingDirectory } from '../../paths'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDomainFolder(domains: string): string {
  const firstDomain = domains.split(',')[0]?.trim() || 'caddy'
  return sanitizeFolderName(firstDomain)
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getCaddyBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'http-configs', 'caddy')
}

async function resolveCaddyBaseDir(): Promise<string> {
  return getCaddyBaseDir(await resolveWorkingDirectory())
}

export function registerCaddyHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.caddy.getAll, () => readCaddyServers())

  ipcMain.handle(IPC_CHANNELS.caddy.add, async (_event, input: CaddyServerInput) => {
    const servers = await readCaddyServers()
    const server: CaddyServer = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...servers, server]
    await writeCaddyServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.caddy.update, async (_event, id: string, input: CaddyServerInput) => {
    const servers = await readCaddyServers()
    const next = servers.map((server) => (server.id === id ? { ...server, ...input } : server))
    await writeCaddyServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.caddy.removeAt, async (_event, id: string) => {
    const servers = await readCaddyServers()
    const target = servers.find((server) => server.id === id)
    if (target) {
      const baseDir = await resolveCaddyBaseDir()
      const targetDir = join(baseDir, getDomainFolder(target.domains))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = servers.filter((server) => server.id !== id)
    await writeCaddyServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.caddy.getDefaultSaveDir, () => resolveCaddyBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.caddy.saveConfFile,
    async (_event, params: SaveConfFileParams): Promise<SaveConfFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolveCaddyBaseDir())
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

  ipcMain.handle(IPC_CHANNELS.caddy.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolveCaddyBaseDir())
    const targetDir = join(baseDir, getDomainFolder(params.domains))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.caddy.openConfigDir, async () => {
    const dir = await resolveCaddyBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
