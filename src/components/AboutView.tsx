import logo from '../assets/logo.png'
import { useI18n } from '../contexts/I18nContext'
import { DATABASES, HTTP_SERVERS } from '../data/tools'
import { IconDatabase, IconGlobe, IconInfo } from '../icons'

const STACK = ['Electron', 'React', 'TypeScript', 'Vite']

export function AboutView() {
  const { t } = useI18n()

  return (
    <div className="view">
      <div className="tool-header">
        <img className="about-logo" src={logo} alt="BeerCat" />
        <div>
          <h1 className="view-title">SYS-BOOTSTRAPPER</h1>
          <p className="view-description">{t.about.description}</p>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconInfo />
          Stack
        </h2>
        <p className="panel-hint">{t.about.stackHint}</p>
        <div className="comp-row">
          {STACK.map((item) => (
            <span className="badge badge-neutral" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t.about.categories}</h2>
        <p className="panel-hint">{t.about.categoriesHint}</p>

        <div className="about-category">
          <IconGlobe />
          <div>
            <strong>{t.nav.httpServers}</strong>
            <span className="text-muted"> — {t.about.engines(HTTP_SERVERS.length)}</span>
          </div>
        </div>
        <div className="about-category">
          <IconDatabase />
          <div>
            <strong>{t.nav.databases}</strong>
            <span className="text-muted"> — {t.about.engines(DATABASES.length)}</span>
          </div>
        </div>
      </div>

      <p className="about-footer">SYS-BOOTSTRAPPER v0.1.0 · {t.about.internalUse}</p>
    </div>
  )
}
