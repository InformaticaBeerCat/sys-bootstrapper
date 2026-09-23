import { useState } from 'react'
import { SiCaddy, SiCaddyHex } from '@icons-pack/react-simple-icons'
import type { CaddyServer, CaddyServerInput } from '../../../electron/shared/http-servers/caddy'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { CaddyConfPreviewModal } from './CaddyConfPreviewModal'
import { CaddyFormModal } from './CaddyFormModal'
import { CaddyShowModal } from './CaddyShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; server: CaddyServer }

interface CaddyViewProps {
  initialServers: CaddyServer[]
}

export function CaddyView({ initialServers }: CaddyViewProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const [servers, setServers] = useState<CaddyServer[]>(initialServers)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showServer, setShowServer] = useState<CaddyServer | null>(null)
  const [confServer, setConfServer] = useState<CaddyServer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CaddyServer | null>(null)

  async function handleSave(values: CaddyServerInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.caddy.update(formState.server.id, values)
        setServers(updated)
        showToast(t.httpServer.edited, 'success')
      } else {
        const updated = await window.sysBootstrapper.caddy.add(values)
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
      const updated = await window.sysBootstrapper.caddy.removeAt(deleteTarget.id)
      setServers(updated)
      showToast(t.httpServer.deleted, 'success')
    } catch {
      showToast(t.httpServer.deleteError, 'danger')
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
          <p className="view-description">{t.caddy.description}</p>
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
                  <th>{t.caddy.mode}</th>
                  <th>Root / Proxy</th>
                  <th>TLS</th>
                  <th>{t.caddy.compression}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {servers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {t.httpServer.empty}
                    </td>
                  </tr>
                ) : (
                  servers.map((server) => (
                    <tr key={server.id}>
                      <td>{server.domains}</td>
                      <td>{server.mode === 'proxy' ? t.caddy.modeProxy : t.caddy.modeStatic}</td>
                      <td>{server.mode === 'proxy' ? server.proxyTarget : server.path || '—'}</td>
                      <td>{t.caddy.tlsShort[server.tls]}</td>
                      <td>{server.encodeGzip ? 'zstd gzip' : '—'}</td>
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
                            {t.common.generate('Caddyfile')}
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
