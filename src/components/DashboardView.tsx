import { useEffect, useState } from 'react'
import type { AppConfig } from '../../electron/shared/config'
import { IconAlert, IconCheckCircle, IconServer } from '../icons'

export function DashboardView() {
  const [config, setConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    window.sysBootstrapper.getConfig().then(setConfig)
  }, [])

  const ready = !!config?.workingDirectory

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Panel</h1>
        <p className="view-description">Estado general de la herramienta.</p>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconServer />
          Estado
        </h2>
        {ready ? (
          <div className="status-line ok">
            <IconCheckCircle />
            Directorio de trabajo listo en <code>{config?.workingDirectory}</code>
          </div>
        ) : (
          <div className="status-line warn">
            <IconAlert />
            Configura un directorio de trabajo para empezar.
          </div>
        )}
      </div>
    </div>
  )
}
