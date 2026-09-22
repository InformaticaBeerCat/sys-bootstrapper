import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ApacheServer } from '../shared/apache'
import { getAppDataDir } from './paths'

function getApacheServersFilePath(): string {
  return join(getAppDataDir(), 'apache-servers.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getApacheServersFilePath()), { recursive: true })
}

export async function readApacheServers(): Promise<ApacheServer[]> {
  try {
    const raw = await readFile(getApacheServersFilePath(), 'utf-8')
    return JSON.parse(raw) as ApacheServer[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeApacheServers(servers: ApacheServer[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getApacheServersFilePath(), JSON.stringify(servers, null, 2), 'utf-8')
}
