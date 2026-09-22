import { IconDashboard, IconSettings } from '../icons'

export type ViewId = 'dashboard' | 'settings'

interface SidebarProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

const NAV_ITEMS: { id: ViewId; label: string; icon: (props: { className?: string }) => JSX.Element }[] = [
  { id: 'dashboard', label: 'Panel', icon: IconDashboard },
  { id: 'settings', label: 'Configuración', icon: IconSettings }
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-text">
          <span className="brand-title">Sys Bootstrapper</span>
          <span className="brand-subtitle">sysadmin toolkit</span>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item${active === id ? ' active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">v0.1.0</div>
    </aside>
  )
}
