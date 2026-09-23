import type { ReactNode } from 'react'
import { useI18n } from '../contexts/I18nContext'
import { IconDashboard, IconInfo, IconNetwork, IconSettings } from '../icons'
import { DATABASES, HTTP_SERVERS } from '../data/tools'
import type { Dictionary } from '../i18n'
import logo from '../assets/logo.png'

export type ViewId =
  | 'dashboard'
  | 'network'
  | 'about'
  | 'settings'
  | 'http-apache'
  | 'http-nginx'
  | 'http-caddy'
  | 'db-mysql'
  | 'db-postgresql'
  | 'db-mongodb'

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

function buildNavGroups(t: Dictionary): NavGroup[] {
  return [
    {
      key: 'inicio',
      items: [{ id: 'dashboard', label: t.nav.home, icon: <IconDashboard /> }]
    },
    {
      key: 'http',
      label: t.nav.httpServers,
      items: HTTP_SERVERS.map((tool) => ({
        id: tool.id as ViewId,
        label: tool.name,
        icon: <tool.Logo size={16} color={tool.brandColor} title={tool.name} />
      }))
    },
    {
      key: 'database',
      label: t.nav.databases,
      items: DATABASES.map((tool) => ({
        id: tool.id as ViewId,
        label: tool.name,
        icon: <tool.Logo size={16} color={tool.brandColor} title={tool.name} />
      }))
    },
    {
      key: 'system',
      label: t.nav.system,
      items: [{ id: 'network', label: t.nav.network, icon: <IconNetwork /> }]
    },
    {
      key: 'general',
      label: t.nav.general,
      items: [
        { id: 'about', label: t.nav.about, icon: <IconInfo /> },
        { id: 'settings', label: t.nav.settings, icon: <IconSettings /> }
      ]
    }
  ]
}

interface SidebarProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { t } = useI18n()

  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-mark" src={logo} alt="BeerCat" />
        <div className="brand-text">
          <span className="brand-title">SYS-BOOTSTRAPPER</span>
          <span className="brand-subtitle">sysadmin toolkit</span>
        </div>
      </div>

      <nav className="nav">
        {buildNavGroups(t).map((group) => (
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
