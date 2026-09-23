import type { AppConfig } from '../../electron/shared/config'
import { IconAlert, IconCheckCircle, IconDatabase, IconFolder, IconGlobe, IconServer, IconTable } from '../icons'
import { ALL_TOOLS, DATABASES, HTTP_SERVERS } from '../data/tools'
import type { ViewId } from './Sidebar'
import logo from '../assets/logo.png'

interface DashboardViewProps {
  config: AppConfig | null
  onNavigate: (view: ViewId) => void
}

export function DashboardView({ config, onNavigate }: DashboardViewProps) {
  const ready = !!config?.workingDirectory

  return (
    <div className="view view-wide">
      <div className="dash-welcome">
        <IconServer className="dash-welcome-watermark" />
        <div className="dash-welcome-info">
          <img className="dash-welcome-mascot" src={logo} alt="BeerCat" />
          <div>
            <h2>¡Bienvenido a SYS-BOOTSTRAPPER!</h2>
            <p>Tu navaja suiza para configurar servidores y bases de datos, todo desde un mismo lugar.</p>
          </div>
        </div>
        <span className="dash-welcome-badge">
          {ready ? <IconCheckCircle /> : <IconAlert />}
          {ready ? 'Directorio configurado' : 'Sin directorio configurado'}
        </span>
      </div>

      <div className="section-title">Resumen</div>
      <div className="cards">
        <div className="card">
          <div className="card-icon">
            <IconGlobe />
          </div>
          <div className="card-label">Servidores HTTP</div>
          <div className="card-value">{HTTP_SERVERS.length}</div>
          <div className="card-hint">Apache · Nginx · Caddy</div>
        </div>

        <div className="card card-alt">
          <div className="card-icon">
            <IconDatabase />
          </div>
          <div className="card-label">Bases de datos</div>
          <div className="card-value">{DATABASES.length}</div>
          <div className="card-hint">MySQL · PostgreSQL · MongoDB +3</div>
        </div>

        <div className="card">
          <div className="card-icon">
            <IconTable />
          </div>
          <div className="card-label">Herramientas totales</div>
          <div className="card-value">{ALL_TOOLS.length}</div>
          <div className="card-hint">Y sumando</div>
        </div>

        <div className={`card${ready ? ' card-alt' : ''}`}>
          <div className="card-icon">
            <IconFolder />
          </div>
          <div className="card-label">Directorio de trabajo</div>
          <div className="card-value">{ready ? 'Listo' : 'Pendiente'}</div>
          <div className="card-hint">{ready ? config?.workingDirectory : 'Configúralo para empezar'}</div>
        </div>
      </div>

      <div className="section-title">Accesos rápidos</div>
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
