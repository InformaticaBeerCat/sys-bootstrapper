import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { MySQLScript } from '../../../shared/databases/mysql'
import { getAppDataDir } from '../../paths'

function getMySQLScriptsFilePath(): string {
  return join(getAppDataDir(), 'mysql-scripts.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getMySQLScriptsFilePath()), { recursive: true })
}

export async function readMySQLScripts(): Promise<MySQLScript[]> {
  try {
    const raw = await readFile(getMySQLScriptsFilePath(), 'utf-8')
    return JSON.parse(raw) as MySQLScript[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeMySQLScripts(scripts: MySQLScript[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getMySQLScriptsFilePath(), JSON.stringify(scripts, null, 2), 'utf-8')
}
