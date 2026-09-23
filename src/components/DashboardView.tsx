import type { AppConfig } from '../../electron/shared/config'
import { useI18n } from '../contexts/I18nContext'
import { IconAlert, IconCheckCircle, IconDatabase, IconFolder, IconGlobe, IconServer, IconTable } from '../icons'
import { ALL_TOOLS, DATABASES, HTTP_SERVERS } from '../data/tools'
import { NetworkStatusCards } from './network/NetworkStatusCards'
import type { ViewId } from './Sidebar'
import logo from '../assets/logo.png'

interface DashboardViewProps {
  config: AppConfig | null
  onNavigate: (view: ViewId) => void
}

export function DashboardView({ config, onNavigate }: DashboardViewProps) {
  const { t } = useI18n()
  const ready = !!config?.workingDirectory

  return (
    <div className="view view-wide">
      <div className="dash-welcome">
        <IconServer className="dash-welcome-watermark" />

        <div className="dash-welcome-top">
          <div className="dash-welcome-info">
            <img className="dash-welcome-mascot" src={logo} alt="BeerCat" />
            <div>
              <div className="dash-welcome-title-row">
                <h2>SYS-BOOTSTRAPPER</h2>
                <span className="dash-version-badge">v0.1.0</span>
              </div>
              <p>{t.dashboard.tagline}</p>
            </div>
          </div>
          <span className="dash-welcome-badge">
            {ready ? <IconCheckCircle /> : <IconAlert />}
            {ready ? t.dashboard.directoryReady : t.dashboard.directoryMissing}
          </span>
        </div>

        <blockquote className="dash-slogan">“{t.dashboard.slogan}”</blockquote>
      </div>

      <div className="section-title">{t.dashboard.gettingStarted}</div>
      <div className="steps">
        {t.dashboard.steps.map((step, i) => (
          <div className="step" key={step.title}>
            <span className="step-number">{i + 1}</span>
            <div>
              <div className="step-title">{step.title}</div>
              <div className="step-text">{step.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">{t.dashboard.summary}</div>
      <div className="cards">
        <div className="card">
          <div className="card-icon">
            <IconGlobe />
          </div>
          <div className="card-label">{t.nav.httpServers}</div>
          <div className="card-value">{HTTP_SERVERS.length}</div>
          <div className="card-hint">Apache · Nginx · Caddy</div>
        </div>

        <div className="card card-alt">
          <div className="card-icon">
            <IconDatabase />
          </div>
          <div className="card-label">{t.nav.databases}</div>
          <div className="card-value">{DATABASES.length}</div>
          <div className="card-hint">MySQL · PostgreSQL · MongoDB +3</div>
        </div>

        <div className="card">
          <div className="card-icon">
            <IconTable />
          </div>
          <div className="card-label">{t.dashboard.totalTools}</div>
          <div className="card-value">{ALL_TOOLS.length}</div>
          <div className="card-hint">{t.dashboard.andCounting}</div>
        </div>

        <div className={`card${ready ? ' card-alt' : ''}`}>
          <div className="card-icon">
            <IconFolder />
          </div>
          <div className="card-label">{t.dashboard.workingDirectory}</div>
          <div className="card-value">{ready ? t.dashboard.ready : t.dashboard.pending}</div>
          <div className="card-hint">{ready ? config?.workingDirectory : t.dashboard.setUpToStart}</div>
        </div>
      </div>

      <div className="section-title">{t.dashboard.network}</div>
      <NetworkStatusCards />

      <div className="section-title">{t.dashboard.quickAccess}</div>
      <div className="tool-tiles">
        {ALL_TOOLS.map((tool) => (
          <button type="button" className="tool-tile" key={tool.id} onClick={() => onNavigate(tool.id as ViewId)}>
            <span className="tool-tile-logo" style={{ background: `${tool.brandColor}22` }}>
              <tool.Logo size={20} color={tool.brandColor} title={tool.name} />
            </span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
