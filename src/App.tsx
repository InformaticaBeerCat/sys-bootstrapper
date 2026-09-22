import { useState } from 'react'
import { Sidebar, type ViewId } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { SettingsView } from './components/SettingsView'
import { AboutView } from './components/AboutView'
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
