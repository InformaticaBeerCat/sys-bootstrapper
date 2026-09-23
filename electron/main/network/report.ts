import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { shell } from 'electron'
import type { NetworkReport, SaveNetworkReportResult } from '../../shared/network'
import { readConfig } from '../configStore'
import { getDefaultWorkingDirectory } from '../paths'
import { describeError } from './exec'
import { collectOverview } from './overview'
import { collectListeningPorts } from './ports'
import { resolvePublicIpDetails } from './publicIp'
import { collectNeighbors, collectRoutes } from './routes'

export async function buildReport(): Promise<NetworkReport> {
  const [overview, publicIp, routes, neighbors, listeningPorts] = await Promise.all([
    collectOverview(),
    resolvePublicIpDetails(),
    collectRoutes(),
    collectNeighbors(),
    collectListeningPorts()
  ])
  return { generatedAt: new Date().toISOString(), overview, publicIp, routes, neighbors, listeningPorts }
}

async function resolveReportsDir(): Promise<string> {
  const config = await readConfig()
  return join(config.workingDirectory || getDefaultWorkingDirectory(), 'network-reports')
}

export async function saveReport(): Promise<SaveNetworkReportResult> {
  try {
    const report = await buildReport()
    const dir = await resolveReportsDir()
    await mkdir(dir, { recursive: true })
    const host = report.overview.hostname.replace(/[^a-zA-Z0-9.-]+/g, '_') || 'host'
    const stamp = report.generatedAt.replace(/[:.]/g, '-')
    const filePath = join(dir, `network-${host}-${stamp}.json`)
    await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8')
    shell.showItemInFolder(filePath)
    return { success: true, filePath }
  } catch (error) {
    return { success: false, error: describeError(error) }
  }
}
