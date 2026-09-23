import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { MongoDBScript } from '../../../shared/databases/mongodb'
import { getAppDataDir } from '../../paths'

function getMongoDBScriptsFilePath(): string {
  return join(getAppDataDir(), 'mongodb-scripts.json')
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(dirname(getMongoDBScriptsFilePath()), { recursive: true })
}

export async function readMongoDBScripts(): Promise<MongoDBScript[]> {
  try {
    const raw = await readFile(getMongoDBScriptsFilePath(), 'utf-8')
    return JSON.parse(raw) as MongoDBScript[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeMongoDBScripts(scripts: MongoDBScript[]): Promise<void> {
  await ensureStoreDir()
  await writeFile(getMongoDBScriptsFilePath(), JSON.stringify(scripts, null, 2), 'utf-8')
}
