import { useState } from 'react'
import type { AppConfig } from '../../electron/shared/config'
import { IconAlert, IconCheckCircle, IconFolder, IconFolderOpen, IconTrash } from '../icons'
import { ConfirmModal } from './modals/ConfirmModal'
import { useToast } from '../contexts/ToastContext'

interface SettingsViewProps {
  config: AppConfig | null
  configPath: string
  defaultWorkingDirectory: string
}

export function SettingsView({ config: initialConfig, configPath, defaultWorkingDirectory }: SettingsViewProps) {
  const { showToast } = useToast()
  const [config, setConfig] = useState<AppConfig | null>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  async function handleSelectDirectory() {
    const selected = await window.sysBootstrapper.dialog.selectDirectory()
    if (!selected) return
    setSaving(true)
    try {
      const updated = await window.sysBootstrapper.config.setWorkingDirectory(selected)
      setConfig(updated)
      setSavedAt(Date.now())
      showToast('Directorio de trabajo actualizado.', 'success')
    } catch {
      showToast('No se pudo guardar el directorio de trabajo.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleClearDirectory() {
    setShowClearConfirm(false)
    setSaving(true)
    try {
      const updated = await window.sysBootstrapper.config.setWorkingDirectory('')
      setConfig(updated)
      setSavedAt(Date.now())
      showToast('Se quitó el directorio de trabajo de la configuración.', 'success')
    } catch {
      showToast('No se pudo quitar el directorio de trabajo.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const hasWorkingDirectory = !!config?.workingDirectory

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Configuración</h1>
        <p className="view-description">
          Define el directorio de trabajo donde esta app guardará los archivos que genere.
        </p>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconFolderOpen />
          Directorio de trabajo
        </h2>
        <p className="panel-hint">Se usará como destino por defecto para los archivos generados.</p>

        <div className="field-row">
          <input
            className="text-input"
            type="text"
            readOnly
            placeholder="Ninguna carpeta seleccionada"
            value={config?.workingDirectory ?? ''}
          />
          <button type="button" className="btn btn-primary" onClick={handleSelectDirectory} disabled={saving}>
            <IconFolder />
            {hasWorkingDirectory ? 'Cambiar' : 'Elegir carpeta'}
          </button>
          {hasWorkingDirectory && (
            <button
              type="button"
              className="btn btn-ghost-danger"
              onClick={() => setShowClearConfirm(true)}
              disabled={saving}
            >
              <IconTrash />
              Quitar
            </button>
          )}
        </div>

        {hasWorkingDirectory ? (
          <div className="status-line ok">
            <IconCheckCircle />
            Directorio configurado{savedAt ? ' y guardado' : ''}.
          </div>
        ) : (
          <>
            <div className="status-line warn">
              <IconAlert />
              Aún no se ha elegido un directorio de trabajo.
            </div>
            {defaultWorkingDirectory && (
              <p className="panel-hint">
                Se utilizará <code>{defaultWorkingDirectory}</code> por defecto.
              </p>
            )}
          </>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Archivo de configuración</h2>
        <p className="panel-hint">Registro JSON guardado en una carpeta de datos oculta del sistema operativo.</p>
        <div className="meta-list">
          <div>
            Ruta: <code>{configPath || '…'}</code>
          </div>
          <div>Última actualización: {config && config.updatedAt !== new Date(0).toISOString() ? new Date(config.updatedAt).toLocaleString() : '— (sin guardar aún)'}</div>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Quitar directorio de trabajo"
          message="Esto solo borra la referencia guardada en la configuración; la carpeta y su contenido en disco no se tocan. ¿Continuar?"
          confirmLabel="Quitar"
          onConfirm={handleClearDirectory}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  )
}
