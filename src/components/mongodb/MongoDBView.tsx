import { useState } from 'react'
import { SiMongodb, SiMongodbHex } from '@icons-pack/react-simple-icons'
import type { MongoDBScript, MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconLink, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { MongoDBFormModal } from './MongoDBFormModal'
import { MongoDBScriptPreviewModal } from './MongoDBScriptPreviewModal'
import { MongoDBShowModal } from './MongoDBShowModal'
import { MongoDBUriModal } from './MongoDBUriModal'

type FormState = { mode: 'create' } | { mode: 'edit'; script: MongoDBScript }

interface MongoDBViewProps {
  initialScripts: MongoDBScript[]
}

export function MongoDBView({ initialScripts }: MongoDBViewProps) {
  const { showToast } = useToast()
  const { t } = useI18n()
  const [scripts, setScripts] = useState<MongoDBScript[]>(initialScripts)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showScript, setShowScript] = useState<MongoDBScript | null>(null)
  const [sqlScript, setSqlScript] = useState<MongoDBScript | null>(null)
  const [uriScript, setUriScript] = useState<MongoDBScript | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MongoDBScript | null>(null)

  async function handleSave(values: MongoDBScriptInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.mongodb.update(formState.script.id, values)
        setScripts(updated)
        showToast(t.database.edited, 'success')
      } else {
        const updated = await window.sysBootstrapper.mongodb.add(values)
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
      const updated = await window.sysBootstrapper.mongodb.removeAt(deleteTarget.id)
      setScripts(updated)
      showToast(t.database.deleted, 'success')
    } catch {
      showToast(t.database.deleteError, 'danger')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleOpenScriptsDir() {
    await window.sysBootstrapper.mongodb.openScriptsDir()
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span className="tool-logo" style={{ background: `${SiMongodbHex}22`, boxShadow: `inset 0 0 0 1px ${SiMongodbHex}55` }}>
          <SiMongodb size={30} color={SiMongodbHex} title="MongoDB" />
        </span>
        <div>
          <h1 className="view-title">MongoDB</h1>
          <p className="view-description">{t.mongodb.description}</p>
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
                  <th>Auth DB</th>
                  <th>Roles</th>
                  <th>Preset</th>
                  <th>bindIp</th>
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
                      <td>{script.authDb}</td>
                      <td>{script.roles}</td>
                      <td>{t.database.presets[script.preset]}</td>
                      <td>{script.bindIp}</td>
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
                            {t.common.generate('.js')}
                          </button>
                          <button type="button" className="btn btn-xs" onClick={() => setUriScript(script)}>
                            <IconLink />
                            {t.common.generate('URI')}
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
        <MongoDBFormModal
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.script : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showScript && <MongoDBShowModal script={showScript} onClose={() => setShowScript(null)} />}

      {sqlScript && <MongoDBScriptPreviewModal script={sqlScript} onClose={() => setSqlScript(null)} />}

      {uriScript && <MongoDBUriModal script={uriScript} onClose={() => setUriScript(null)} />}

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
