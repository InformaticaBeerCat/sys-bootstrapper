import { useState } from 'react'
import { SiApache, SiApacheHex } from '@icons-pack/react-simple-icons'
import type { ApacheServer, ApacheServerInput } from '../../../electron/shared/http-servers/apache'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { ApacheConfPreviewModal } from './ApacheConfPreviewModal'
import { ApacheFormModal } from './ApacheFormModal'
import { ApacheShowModal } from './ApacheShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; server: ApacheServer }

interface ApacheViewProps {
  initialServers: ApacheServer[]
}

export function ApacheView({ initialServers }: ApacheViewProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const [servers, setServers] = useState<ApacheServer[]>(initialServers)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showServer, setShowServer] = useState<ApacheServer | null>(null)
  const [confServer, setConfServer] = useState<ApacheServer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApacheServer | null>(null)

  async function handleSave(values: ApacheServerInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.apache.update(formState.server.id, values)
        setServers(updated)
        showToast(t.httpServer.edited, 'success')
      } else {
        const updated = await window.sysBootstrapper.apache.add(values)
        setServers(updated)
        showToast(t.httpServer.created, 'success')
      }
      setFormState(null)
    } catch {
      showToast(t.httpServer.saveError, 'danger')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const updated = await window.sysBootstrapper.apache.removeAt(deleteTarget.id)
      setServers(updated)
      showToast(t.httpServer.deleted, 'success')
    } catch {
      showToast(t.httpServer.deleteError, 'danger')
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
          <p className="view-description">{t.apache.description}</p>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <h2 className="panel-title">
            <IconTable />
            {t.httpServer.configurations}
          </h2>
          <div className="comp-row">
            <span className="badge badge-neutral">{t.common.records(servers.length)}</span>
            <button type="button" className="btn btn-sm" onClick={handleOpenConfigDir}>
              <IconFolderOpen />
              {t.common.openDirectory}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormState({ mode: 'create' })}>
              <IconPlus />
              {t.common.new}
            </button>
          </div>
        </div>

        <div className="panel-body">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.httpServer.domains}</th>
                  <th>HTTP</th>
                  <th>HTTPS</th>
                  <th>Path / Proxy</th>
                  <th>SSL</th>
                  <th>Redirect</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {servers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      {t.httpServer.empty}
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
                      <td>{server.redirect ? '301 → https' : t.common.no}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-xs" onClick={() => setShowServer(server)}>
                            <IconEye />
                            {t.common.view}
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            onClick={() => setFormState({ mode: 'edit', server })}
                          >
                            <IconEdit />
                            {t.common.edit}
                          </button>
                          <button type="button" className="btn btn-xs" onClick={() => setConfServer(server)}>
                            <IconTools />
                            {t.common.generate('.conf')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteTarget(server)}
                            aria-label={t.httpServer.deleteTitle}
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
          title={t.httpServer.deleteTitle}
          message={t.common.deleteRecordMessage(deleteTarget.domains)}
          confirmLabel={t.common.delete}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
