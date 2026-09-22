import { useEffect, useState } from 'react'
import { SiApache, SiApacheHex } from '@icons-pack/react-simple-icons'
import type { ApacheServer, ApacheServerInput } from '../../../electron/shared/http-servers/apache'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { ApacheConfPreviewModal } from './ApacheConfPreviewModal'
import { ApacheFormModal } from './ApacheFormModal'
import { ApacheShowModal } from './ApacheShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; server: ApacheServer }

export function ApacheView() {
  const { showToast } = useToast()
  const [servers, setServers] = useState<ApacheServer[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showServer, setShowServer] = useState<ApacheServer | null>(null)
  const [confServer, setConfServer] = useState<ApacheServer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApacheServer | null>(null)

  useEffect(() => {
    window.sysBootstrapper.apache
      .getAll()
      .then(setServers)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(values: ApacheServerInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.apache.update(formState.server.id, values)
        setServers(updated)
        showToast('Configuración editada exitosamente.', 'success')
      } else {
        const updated = await window.sysBootstrapper.apache.add(values)
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
      const updated = await window.sysBootstrapper.apache.removeAt(deleteTarget.id)
      setServers(updated)
      showToast('Configuración eliminada exitosamente.', 'success')
    } catch {
      showToast('No se pudo eliminar la configuración.', 'danger')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleOpenConfigDir() {
    await window.sysBootstrapper.apache.openConfigDir()
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span className="tool-logo" style={{ background: `${SiApacheHex}22`, boxShadow: `inset 0 0 0 1px ${SiApacheHex}55` }}>
          <SiApache size={30} color={SiApacheHex} title="Apache" />
        </span>
        <div>
          <h1 className="view-title">Apache</h1>
          <p className="view-description">
            Configuraciones de VirtualHost para Apache: dominios, HTTP/HTTPS, SSL y proxy inverso.
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
                  <th>HTTP</th>
                  <th>HTTPS</th>
                  <th>Path / Proxy</th>
                  <th>SSL</th>
                  <th>Redirect</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      {loading ? 'Cargando…' : 'No hay configuraciones registradas — usa "Nueva" para agregar la primera.'}
                    </td>
                  </tr>
                ) : (
                  servers.map((server) => (
                    <tr key={server.id}>
                      <td>{server.domains}</td>
                      <td>{server.http ? '80' : '—'}</td>
                      <td>{server.https ? '443' : '—'}</td>
                      <td>{server.isProxy ? `http://${server.proxyTarget}` : server.path || '—'}</td>
                      <td>{server.https ? server.ssl : '—'}</td>
                      <td>{server.redirect ? '301 → https' : 'No'}</td>
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
                            Generar .conf
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
        <ApacheFormModal
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.server : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showServer && <ApacheShowModal server={showServer} onClose={() => setShowServer(null)} />}

      {confServer && <ApacheConfPreviewModal server={confServer} onClose={() => setConfServer(null)} />}

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
