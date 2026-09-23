import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { CaddyServer } from '../../../shared/http-servers/caddy'
import { getAppDataDir } from '../../paths'

function getCaddyServersFilePath(): string {
  return join(getAppDataDir(), 'caddy-servers.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getCaddyServersFilePath()), { recursive: true })
}

export async function readCaddyServers(): Promise<CaddyServer[]> {
  try {
    const raw = await readFile(getCaddyServersFilePath(), 'utf-8')
    return JSON.parse(raw) as CaddyServer[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeCaddyServers(servers: CaddyServer[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getCaddyServersFilePath(), JSON.stringify(servers, null, 2), 'utf-8')
}
