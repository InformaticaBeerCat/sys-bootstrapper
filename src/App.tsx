import { useEffect, useRef, useState } from 'react'
import { Sidebar, type ViewId } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { SettingsView } from './components/SettingsView'
import { AboutView } from './components/AboutView'
import { ApacheView } from './components/apache/ApacheView'
import { NginxView } from './components/nginx/NginxView'
import { CaddyView } from './components/caddy/CaddyView'
import { MySQLView } from './components/mysql/MySQLView'
import { ToolRecordsView } from './components/records/ToolRecordsView'
import { TopLoadingBar } from './components/TopLoadingBar'
import { findTool } from './data/tools'
import type { AppConfig } from '../electron/shared/config'
import type { ApacheServer } from '../electron/shared/http-servers/apache'
import type { NginxServer } from '../electron/shared/http-servers/nginx'
import type { CaddyServer } from '../electron/shared/http-servers/caddy'
import type { MySQLScript } from '../electron/shared/databases/mysql'

interface ViewData {
  config?: AppConfig
  configPath?: string
  defaultWorkingDirectory?: string
  apache?: ApacheServer[]
  nginx?: NginxServer[]
  caddy?: CaddyServer[]
  mysql?: MySQLScript[]
}

/** Trae de una sola vez todo lo que la vista destino necesita, antes de mostrarla. */
async function loadViewData(view: ViewId): Promise<ViewData> {
  switch (view) {
    case 'dashboard':
      return { config: await window.sysBootstrapper.config.get() }
    case 'settings': {
      const [config, configPath, defaultWorkingDirectory] = await Promise.all([
        window.sysBootstrapper.config.get(),
        window.sysBootstrapper.config.getPath(),
        window.sysBootstrapper.config.getDefaultWorkingDirectory()
      ])
      return { config, configPath, defaultWorkingDirectory }
    }
    case 'http-apache':
      return { apache: await window.sysBootstrapper.apache.getAll() }
    case 'http-nginx':
      return { nginx: await window.sysBootstrapper.nginx.getAll() }
    case 'http-caddy':
      return { caddy: await window.sysBootstrapper.caddy.getAll() }
    case 'db-mysql':
      return { mysql: await window.sysBootstrapper.mysql.getAll() }
    default:
      return {}
  }
}

function renderView(view: ViewId, data: ViewData, onNavigate: (view: ViewId) => void) {
  switch (view) {
    case 'dashboard':
      return <DashboardView config={data.config ?? null} onNavigate={onNavigate} />
    case 'about':
      return <AboutView />
    case 'settings':
      return (
        <SettingsView
          config={data.config ?? null}
          configPath={data.configPath ?? ''}
          defaultWorkingDirectory={data.defaultWorkingDirectory ?? ''}
        />
      )
    case 'http-apache':
      return <ApacheView initialServers={data.apache ?? []} />
    case 'http-nginx':
      return <NginxView initialServers={data.nginx ?? []} />
    case 'http-caddy':
      return <CaddyView initialServers={data.caddy ?? []} />
    case 'db-mysql':
      return <MySQLView initialScripts={data.mysql ?? []} />
    default: {
      const tool = findTool(view)
      return tool ? <ToolRecordsView tool={tool} /> : <DashboardView config={data.config ?? null} onNavigate={onNavigate} />
    }
  }
}

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard')
  const [data, setData] = useState<ViewData>({})
  const [navigating, setNavigating] = useState(false)
  const navigatingRef = useRef(false)

  async function goTo(next: ViewId) {
    navigatingRef.current = true
    setNavigating(true)
    try {
      const result = await loadViewData(next)
      setData((prev) => ({ ...prev, ...result }))
      setView(next)
    } finally {
      navigatingRef.current = false
      setNavigating(false)
    }
  }

  useEffect(() => {
    goTo('dashboard')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleNavigate(next: ViewId) {
    if (next === view || navigatingRef.current) return
    goTo(next)
  }

  return (
    <div className="app-shell">
      <TopLoadingBar active={navigating} />
      <Sidebar active={view} onNavigate={handleNavigate} />
      <main className="content">{renderView(view, data, handleNavigate)}</main>
    </div>
  )
}
