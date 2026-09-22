import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { AppConfig, DEFAULT_CONFIG } from '../shared/config'
import { getConfigFilePath } from './paths'

async function ensureConfigDir(): Promise<void> {
  await mkdir(dirname(getConfigFilePath()), { recursive: true })
}

export async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await readFile(getConfigFilePath(), 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return DEFAULT_CONFIG
    }
    throw error
  }
}

export async function writeConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
  const current = await readConfig()
  const next: AppConfig = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString()
  }
  await ensureConfigDir()
  await writeFile(getConfigFilePath(), JSON.stringify(next, null, 2), 'utf-8')
  return next
}
