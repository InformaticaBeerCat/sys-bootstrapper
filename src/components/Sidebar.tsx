import type { ReactNode } from 'react'
import { IconDashboard, IconInfo, IconSettings } from '../icons'
import { DATABASES, HTTP_SERVERS } from '../data/tools'
import logo from '../assets/logo.png'

export type ViewId =
  | 'dashboard'
  | 'about'
  | 'settings'
  | 'http-apache'
  | 'http-nginx'
  | 'http-caddy'
  | 'db-mysql'
  | 'db-postgresql'
  | 'db-mongodb'
  | 'db-redis'
  | 'db-sqlite'
  | 'db-mariadb'

interface NavEntry {
  id: ViewId
  label: string
  icon: ReactNode
}

interface NavGroup {
  key: string
  label?: string
  items: NavEntry[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'inicio',
    items: [{ id: 'dashboard', label: 'Inicio', icon: <IconDashboard /> }]
  },
  {
    key: 'http',
    label: 'Servidores HTTP',
    items: HTTP_SERVERS.map((tool) => ({
      id: tool.id as ViewId,
      label: tool.name,
      icon: <tool.Logo size={16} color={tool.brandColor} title={tool.name} />
    }))
  },
  {
    key: 'database',
    label: 'Bases de datos',
    items: DATABASES.map((tool) => ({
      id: tool.id as ViewId,
      label: tool.name,
      icon: <tool.Logo size={16} color={tool.brandColor} title={tool.name} />
    }))
  },
  {
    key: 'general',
    label: 'General',
    items: [
      { id: 'about', label: 'Acerca de', icon: <IconInfo /> },
      { id: 'settings', label: 'Configuración', icon: <IconSettings /> }
    ]
  }
]

interface SidebarProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-mark" src={logo} alt="BeerCat" />
        <div className="brand-text">
          <span className="brand-title">Sys Bootstrapper</span>
          <span className="brand-subtitle">sysadmin toolkit</span>
        </div>
      </div>

      <nav className="nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.key}>
            {group.label && <div className="nav-section">{group.label}</div>}
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">v0.1.0</div>
    </aside>
  )
}
