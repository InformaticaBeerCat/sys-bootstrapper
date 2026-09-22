import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { NginxServer } from '../../../shared/http-servers/nginx'
import { getAppDataDir } from '../../paths'

function getNginxServersFilePath(): string {
  return join(getAppDataDir(), 'nginx-servers.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getNginxServersFilePath()), { recursive: true })
}

export async function readNginxServers(): Promise<NginxServer[]> {
  try {
    const raw = await readFile(getNginxServersFilePath(), 'utf-8')
    return JSON.parse(raw) as NginxServer[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeNginxServers(servers: NginxServer[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getNginxServersFilePath(), JSON.stringify(servers, null, 2), 'utf-8')
}
