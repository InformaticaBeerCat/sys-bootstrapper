import { useState } from 'react'
import { SiPostgresql, SiPostgresqlHex } from '@icons-pack/react-simple-icons'
import type { PostgreSQLScript, PostgreSQLScriptInput } from '../../../electron/shared/databases/postgresql'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { PostgreSQLFormModal } from './PostgreSQLFormModal'
import { PostgreSQLScriptPreviewModal } from './PostgreSQLScriptPreviewModal'
import { PostgreSQLShowModal } from './PostgreSQLShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; script: PostgreSQLScript }

interface PostgreSQLViewProps {
  initialScripts: PostgreSQLScript[]
}

export function PostgreSQLView({ initialScripts }: PostgreSQLViewProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const [scripts, setScripts] = useState<PostgreSQLScript[]>(initialScripts)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showScript, setShowScript] = useState<PostgreSQLScript | null>(null)
  const [sqlScript, setSqlScript] = useState<PostgreSQLScript | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PostgreSQLScript | null>(null)

  async function handleSave(values: PostgreSQLScriptInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.postgresql.update(formState.script.id, values)
        setScripts(updated)
        showToast(t.database.edited, 'success')
      } else {
        const updated = await window.sysBootstrapper.postgresql.add(values)
        setScripts(updated)
        showToast(t.database.created, 'success')
      }
      setFormState(null)
    } catch {
      showToast(t.database.saveError, 'danger')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const updated = await window.sysBootstrapper.postgresql.removeAt(deleteTarget.id)
      setScripts(updated)
      showToast(t.database.deleted, 'success')
    } catch {
      showToast(t.database.deleteError, 'danger')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleOpenScriptsDir() {
    await window.sysBootstrapper.postgresql.openScriptsDir()
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span
          className="tool-logo"
          style={{ background: `${SiPostgresqlHex}22`, boxShadow: `inset 0 0 0 1px ${SiPostgresqlHex}55` }}
        >
          <SiPostgresql size={30} color={SiPostgresqlHex} title="PostgreSQL" />
        </span>
        <div>
          <h1 className="view-title">PostgreSQL</h1>
          <p className="view-description">{t.postgresql.description}</p>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <h2 className="panel-title">
            <IconTable />
            Scripts
          </h2>
          <div className="comp-row">
            <span className="badge badge-neutral">{t.common.records(scripts.length)}</span>
            <button type="button" className="btn btn-sm" onClick={handleOpenScriptsDir}>
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
                  <th>{t.database.database}</th>
                  <th>{t.database.user}</th>
                  <th>{t.postgresql.allowedConnections}</th>
                  <th>{t.database.privileges}</th>
                  <th>Preset</th>
                  <th>{t.database.encoding}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {scripts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      {t.database.empty}
                    </td>
                  </tr>
                ) : (
                  scripts.map((script) => (
                    <tr key={script.id}>
                      <td>{script.dbName}</td>
                      <td>{script.userName}</td>
                      <td>{script.allowedHost}</td>
                      <td>{script.privileges}</td>
                      <td>{t.database.presets[script.preset]}</td>
                      <td>{script.encoding}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-xs" onClick={() => setShowScript(script)}>
                            <IconEye />
                            {t.common.view}
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            onClick={() => setFormState({ mode: 'edit', script })}
                          >
                            <IconEdit />
                            {t.common.edit}
                          </button>
                          <button type="button" className="btn btn-xs" onClick={() => setSqlScript(script)}>
                            <IconTools />
                            {t.common.generate('.sql')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteTarget(script)}
                            aria-label={t.database.deleteTitle}
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
        <PostgreSQLFormModal
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.script : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showScript && <PostgreSQLShowModal script={showScript} onClose={() => setShowScript(null)} />}

      {sqlScript && <PostgreSQLScriptPreviewModal script={sqlScript} onClose={() => setSqlScript(null)} />}

      {deleteTarget && (
        <ConfirmModal
          title={t.database.deleteTitle}
          message={t.common.deleteRecordMessage(deleteTarget.dbName)}
          confirmLabel={t.common.delete}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
