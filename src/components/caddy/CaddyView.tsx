import { useEffect, useState } from 'react'
import { SiCaddy, SiCaddyHex } from '@icons-pack/react-simple-icons'
import type { CaddyServer, CaddyServerInput } from '../../../electron/shared/http-servers/caddy'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { CaddyConfPreviewModal } from './CaddyConfPreviewModal'
import { CaddyFormModal } from './CaddyFormModal'
import { CaddyShowModal } from './CaddyShowModal'

const TLS_LABELS: Record<CaddyServer['tls'], string> = {
  auto: 'Automático',
  internal: 'Interno',
  custom: 'Personalizado',
  off: 'Desactivado'
}

type FormState = { mode: 'create' } | { mode: 'edit'; server: CaddyServer }

export function CaddyView() {
  const { showToast } = useToast()
  const [servers, setServers] = useState<CaddyServer[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showServer, setShowServer] = useState<CaddyServer | null>(null)
  const [confServer, setConfServer] = useState<CaddyServer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CaddyServer | null>(null)

  useEffect(() => {
    window.sysBootstrapper.caddy
      .getAll()
      .then(setServers)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(values: CaddyServerInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.caddy.update(formState.server.id, values)
        setServers(updated)
        showToast('Configuración editada exitosamente.', 'success')
      } else {
        const updated = await window.sysBootstrapper.caddy.add(values)
        setServers(updated)
        showToast('Configuración creada exitosamente.', 'success')
      }
      setFormState(null)
    } catch {
      showToast('No se pudo guardar la configuración.', 'danger')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const updated = await window.sysBootstrapper.caddy.removeAt(deleteTarget.id)
      setServers(updated)
      showToast('Configuración eliminada exitosamente.', 'success')
    } catch {
      showToast('No se pudo eliminar la configuración.', 'danger')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleOpenConfigDir() {
    await window.sysBootstrapper.caddy.openConfigDir()
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span className="tool-logo" style={{ background: `${SiCaddyHex}22`, boxShadow: `inset 0 0 0 1px ${SiCaddyHex}55` }}>
          <SiCaddy size={30} color={SiCaddyHex} title="Caddy" />
        </span>
        <div>
          <h1 className="view-title">Caddy</h1>
          <p className="view-description">
            Configuraciones de sitio para Caddy: dominios, HTTPS automático, proxy inverso y archivos estáticos.
          </p>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <h2 className="panel-title">
            <IconTable />
            Configuraciones
          </h2>
          <div className="comp-row">
            <span className="badge badge-neutral">{servers.length} registro(s)</span>
            <button type="button" className="btn btn-sm" onClick={handleOpenConfigDir}>
              <IconFolderOpen />
              Abrir directorio
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormState({ mode: 'create' })}>
              <IconPlus />
              Nueva
            </button>
          </div>
        </div>

        <div className="panel-body">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dominios</th>
                  <th>Modo</th>
                  <th>Root / Proxy</th>
                  <th>TLS</th>
                  <th>Compresión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {loading ? 'Cargando…' : 'No hay configuraciones registradas — usa "Nueva" para agregar la primera.'}
                    </td>
                  </tr>
                ) : (
                  servers.map((server) => (
                    <tr key={server.id}>
                      <td>{server.domains}</td>
                      <td>{server.mode === 'proxy' ? 'Proxy' : 'Estático'}</td>
                      <td>{server.mode === 'proxy' ? server.proxyTarget : server.path || '—'}</td>
                      <td>{TLS_LABELS[server.tls]}</td>
                      <td>{server.encodeGzip ? 'zstd gzip' : '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-xs" onClick={() => setShowServer(server)}>
                            <IconEye />
                            Ver
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            onClick={() => setFormState({ mode: 'edit', server })}
                          >
                            <IconEdit />
                            Editar
                          </button>
                          <button type="button" className="btn btn-xs" onClick={() => setConfServer(server)}>
                            <IconTools />
                            Generar Caddyfile
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteTarget(server)}
                            aria-label="Eliminar configuración"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formState && (
        <CaddyFormModal
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.server : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showServer && <CaddyShowModal server={showServer} onClose={() => setShowServer(null)} />}

      {confServer && <CaddyConfPreviewModal server={confServer} onClose={() => setConfServer(null)} />}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar configuración"
          message={`Esto elimina el registro y, si existe, la carpeta generada en disco para "${deleteTarget.domains}". ¿Continuar?`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
