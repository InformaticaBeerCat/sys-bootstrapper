import { useState } from 'react'
import { SiMongodb, SiMongodbHex } from '@icons-pack/react-simple-icons'
import type { MongoDBScript, MongoDBScriptInput } from '../../../electron/shared/databases/mongodb'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { MongoDBFormModal } from './MongoDBFormModal'
import { MongoDBScriptPreviewModal } from './MongoDBScriptPreviewModal'
import { MongoDBShowModal } from './MongoDBShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; script: MongoDBScript }

interface MongoDBViewProps {
  initialScripts: MongoDBScript[]
}

export function MongoDBView({ initialScripts }: MongoDBViewProps) {
  const { showToast } = useToast()
  const [scripts, setScripts] = useState<MongoDBScript[]>(initialScripts)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showScript, setShowScript] = useState<MongoDBScript | null>(null)
  const [sqlScript, setSqlScript] = useState<MongoDBScript | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MongoDBScript | null>(null)

  async function handleSave(values: MongoDBScriptInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.mongodb.update(formState.script.id, values)
        setScripts(updated)
        showToast('Script editado exitosamente.', 'success')
      } else {
        const updated = await window.sysBootstrapper.mongodb.add(values)
        setScripts(updated)
        showToast('Script creado exitosamente.', 'success')
      }
      setFormState(null)
    } catch {
      showToast('No se pudo guardar el script.', 'danger')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const updated = await window.sysBootstrapper.mongodb.removeAt(deleteTarget.id)
      setScripts(updated)
      showToast('Script eliminado exitosamente.', 'success')
    } catch {
      showToast('No se pudo eliminar el script.', 'danger')
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
          <p className="view-description">Scripts mongosh para crear base, usuario y roles en MongoDB.</p>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <h2 className="panel-title">
            <IconTable />
            Scripts
          </h2>
          <div className="comp-row">
            <span className="badge badge-neutral">{scripts.length} registro(s)</span>
            <button type="button" className="btn btn-sm" onClick={handleOpenScriptsDir}>
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
                  <th>Base de datos</th>
                  <th>Usuario</th>
                  <th>Auth DB</th>
                  <th>Roles</th>
                  <th>Preset</th>
                  <th>bindIp</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {scripts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      No hay scripts registrados — usa "Nueva" para agregar el primero.
                    </td>
                  </tr>
                ) : (
                  scripts.map((script) => (
                    <tr key={script.id}>
                      <td>{script.dbName}</td>
                      <td>{script.userName}</td>
                      <td>{script.authDb}</td>
                      <td>{script.roles}</td>
                      <td>{script.preset}</td>
                      <td>{script.bindIp}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-xs" onClick={() => setShowScript(script)}>
                            <IconEye />
                            Ver
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            onClick={() => setFormState({ mode: 'edit', script })}
                          >
                            <IconEdit />
                            Editar
                          </button>
                          <button type="button" className="btn btn-xs" onClick={() => setSqlScript(script)}>
                            <IconTools />
                            Generar .js
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteTarget(script)}
                            aria-label="Eliminar script"
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

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar script"
          message={`Esto elimina el registro y, si existe, la carpeta generada en disco para "${deleteTarget.dbName}". ¿Continuar?`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
