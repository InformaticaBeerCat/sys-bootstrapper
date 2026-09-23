import { useState } from 'react'
import { Sidebar, type ViewId } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { SettingsView } from './components/SettingsView'
import { AboutView } from './components/AboutView'
import { ApacheView } from './components/apache/ApacheView'
import { NginxView } from './components/nginx/NginxView'
import { CaddyView } from './components/caddy/CaddyView'
import { MySQLView } from './components/mysql/MySQLView'
import { ToolRecordsView } from './components/records/ToolRecordsView'
import { findTool } from './data/tools'

function renderView(view: ViewId, onNavigate: (view: ViewId) => void) {
  switch (view) {
    case 'dashboard':
      return <DashboardView onNavigate={onNavigate} />
    case 'about':
      return <AboutView />
    case 'settings':
      return <SettingsView />
    case 'http-apache':
      return <ApacheView />
    case 'http-nginx':
      return <NginxView />
    case 'http-caddy':
      return <CaddyView />
    case 'db-mysql':
      return <MySQLView />
    default: {
      const tool = findTool(view)
      return tool ? <ToolRecordsView tool={tool} /> : <DashboardView onNavigate={onNavigate} />
    }
  }
}

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard')

  return (
    <div className="app-shell">
      <Sidebar active={view} onNavigate={setView} />
      <main className="content">{renderView(view, setView)}</main>
    </div>
  )
}
