import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { access, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ipcMain, shell } from 'electron'
import type {
  FileExistsParams,
  NginxServer,
  NginxServerInput,
  SaveConfFileParams,
  SaveConfFileResult
} from '../../../shared/http-servers/nginx'
import { IPC_CHANNELS } from '../../../shared/ipcChannels'
import { readNginxServers, writeNginxServers } from './store'
import { readConfig } from '../../configStore'
import { getDefaultWorkingDirectory } from '../../paths'

function sanitizeFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]+/g, '_')
}

function getDomainFolder(domains: string): string {
  const firstDomain = domains.split(',')[0]?.trim() || 'nginx'
  return sanitizeFolderName(firstDomain)
}

async function resolveWorkingDirectory(): Promise<string> {
  const config = await readConfig()
  return config.workingDirectory || getDefaultWorkingDirectory()
}

function getNginxBaseDir(workingDirectory: string): string {
  return join(workingDirectory, 'http-configs', 'nginx')
}

async function resolveNginxBaseDir(): Promise<string> {
  return getNginxBaseDir(await resolveWorkingDirectory())
}

export function registerNginxHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.nginx.getAll, () => readNginxServers())

  ipcMain.handle(IPC_CHANNELS.nginx.add, async (_event, input: NginxServerInput) => {
    const servers = await readNginxServers()
    const server: NginxServer = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
    const next = [...servers, server]
    await writeNginxServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.nginx.update, async (_event, id: string, input: NginxServerInput) => {
    const servers = await readNginxServers()
    const next = servers.map((server) => (server.id === id ? { ...server, ...input } : server))
    await writeNginxServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.nginx.removeAt, async (_event, id: string) => {
    const servers = await readNginxServers()
    const target = servers.find((server) => server.id === id)
    if (target) {
      const baseDir = await resolveNginxBaseDir()
      const targetDir = join(baseDir, getDomainFolder(target.domains))
      await rm(targetDir, { recursive: true, force: true })
    }
    const next = servers.filter((server) => server.id !== id)
    await writeNginxServers(next)
    return next
  })

  ipcMain.handle(IPC_CHANNELS.nginx.getDefaultSaveDir, () => resolveNginxBaseDir())

  ipcMain.handle(
    IPC_CHANNELS.nginx.saveConfFile,
    async (_event, params: SaveConfFileParams): Promise<SaveConfFileResult> => {
      try {
        const baseDir = params.saveDir || (await resolveNginxBaseDir())
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

  ipcMain.handle(IPC_CHANNELS.nginx.fileExists, async (_event, params: FileExistsParams) => {
    const baseDir = params.saveDir || (await resolveNginxBaseDir())
    const targetDir = join(baseDir, getDomainFolder(params.domains))
    try {
      await access(join(targetDir, params.filename), constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.nginx.openConfigDir, async () => {
    const dir = await resolveNginxBaseDir()
    await mkdir(dir, { recursive: true })
    return shell.openPath(dir)
  })
}
