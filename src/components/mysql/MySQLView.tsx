import { useState } from 'react'
import { SiMysql, SiMysqlHex } from '@icons-pack/react-simple-icons'
import type { MySQLScript, MySQLScriptInput } from '../../../electron/shared/databases/mysql'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { MySQLFormModal } from './MySQLFormModal'
import { MySQLScriptPreviewModal } from './MySQLScriptPreviewModal'
import { MySQLShowModal } from './MySQLShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; script: MySQLScript }

interface MySQLViewProps {
  initialScripts: MySQLScript[]
}

export function MySQLView({ initialScripts }: MySQLViewProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const [scripts, setScripts] = useState<MySQLScript[]>(initialScripts)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showScript, setShowScript] = useState<MySQLScript | null>(null)
  const [sqlScript, setSqlScript] = useState<MySQLScript | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MySQLScript | null>(null)

  async function handleSave(values: MySQLScriptInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.mysql.update(formState.script.id, values)
        setScripts(updated)
        showToast(t.database.edited, 'success')
      } else {
        const updated = await window.sysBootstrapper.mysql.add(values)
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
      const updated = await window.sysBootstrapper.mysql.removeAt(deleteTarget.id)
      setScripts(updated)
      showToast(t.database.deleted, 'success')
    } catch {
      showToast(t.database.deleteError, 'danger')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleOpenScriptsDir() {
    await window.sysBootstrapper.mysql.openScriptsDir()
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span className="tool-logo" style={{ background: `${SiMysqlHex}22`, boxShadow: `inset 0 0 0 1px ${SiMysqlHex}55` }}>
          <SiMysql size={30} color={SiMysqlHex} title="MySQL" />
        </span>
        <div>
          <h1 className="view-title">MySQL</h1>
          <p className="view-description">{t.mysql.description}</p>
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
                  <th>Host</th>
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
                      <td>{script.host}</td>
                      <td>{script.privileges}</td>
                      <td>{t.database.presets[script.preset]}</td>
                      <td>{script.charset}</td>
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
        <MySQLFormModal
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.script : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showScript && <MySQLShowModal script={showScript} onClose={() => setShowScript(null)} />}

      {sqlScript && <MySQLScriptPreviewModal script={sqlScript} onClose={() => setSqlScript(null)} />}

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
