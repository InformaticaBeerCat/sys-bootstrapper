import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { PostgreSQLScript } from '../../../shared/databases/postgresql'
import { getAppDataDir } from '../../paths'

function getPostgreSQLScriptsFilePath(): string {
  return join(getAppDataDir(), 'postgresql-scripts.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getPostgreSQLScriptsFilePath()), { recursive: true })
}

export async function readPostgreSQLScripts(): Promise<PostgreSQLScript[]> {
  try {
    const raw = await readFile(getPostgreSQLScriptsFilePath(), 'utf-8')
    return JSON.parse(raw) as PostgreSQLScript[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writePostgreSQLScripts(scripts: PostgreSQLScript[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getPostgreSQLScriptsFilePath(), JSON.stringify(scripts, null, 2), 'utf-8')
}
