import logo from '../assets/logo.png'
import { DATABASES, HTTP_SERVERS } from '../data/tools'
import { IconDatabase, IconGlobe, IconInfo } from '../icons'

const STACK = ['Electron', 'React', 'TypeScript', 'Vite']

export function AboutView() {
  return (
    <div className="view">
      <div className="tool-header">
        <img className="about-logo" src={logo} alt="BeerCat" />
        <div>
          <h1 className="view-title">SYS-BOOTSTRAPPER</h1>
          <p className="view-description">
            La navaja suiza de BeerCat para sysadmins: configuraciones y utilidades de uso frecuente, todas en un
            mismo lugar.
          </p>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconInfo />
          Stack
        </h2>
        <p className="panel-hint">Con qué está construida la app.</p>
        <div className="comp-row">
          {STACK.map((item) => (
            <span className="badge badge-neutral" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Categorías disponibles</h2>
        <p className="panel-hint">Más utilidades y generadores van llegando por categoría.</p>

        <div className="about-category">
          <IconGlobe />
          <div>
            <strong>Servidores HTTP</strong>
            <span className="text-muted"> — {HTTP_SERVERS.length} motores</span>
          </div>
        </div>
        <div className="about-category">
          <IconDatabase />
          <div>
            <strong>Bases de datos</strong>
            <span className="text-muted"> — {DATABASES.length} motores</span>
          </div>
        </div>
      </div>

      <p className="about-footer">SYS-BOOTSTRAPPER v0.1.0 · Uso interno BeerCat</p>
    </div>
  )
}
