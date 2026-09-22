import { useState } from 'react'
import { Sidebar, type ViewId } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { SettingsView } from './components/SettingsView'

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard')

  return (
    <div className="app-shell">
      <Sidebar active={view} onNavigate={setView} />
      <main className="content">{view === 'dashboard' ? <DashboardView /> : <SettingsView />}</main>
    </div>
  )
}
