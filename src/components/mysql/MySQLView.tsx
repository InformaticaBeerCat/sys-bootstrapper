import { useEffect, useState } from 'react'
import { SiMysql, SiMysqlHex } from '@icons-pack/react-simple-icons'
import type { MySQLScript, MySQLScriptInput } from '../../../electron/shared/databases/mysql'
import { useToast } from '../../contexts/ToastContext'
import { IconEdit, IconEye, IconFolderOpen, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { MySQLFormModal } from './MySQLFormModal'
import { MySQLScriptPreviewModal } from './MySQLScriptPreviewModal'
import { MySQLShowModal } from './MySQLShowModal'

type FormState = { mode: 'create' } | { mode: 'edit'; script: MySQLScript }

export function MySQLView() {
  const { showToast } = useToast()
  const [scripts, setScripts] = useState<MySQLScript[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showScript, setShowScript] = useState<MySQLScript | null>(null)
  const [sqlScript, setSqlScript] = useState<MySQLScript | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MySQLScript | null>(null)

  useEffect(() => {
    window.sysBootstrapper.mysql
      .getAll()
      .then(setScripts)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(values: MySQLScriptInput) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await window.sysBootstrapper.mysql.update(formState.script.id, values)
        setScripts(updated)
        showToast('Script editado exitosamente.', 'success')
      } else {
        const updated = await window.sysBootstrapper.mysql.add(values)
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
      const updated = await window.sysBootstrapper.mysql.removeAt(deleteTarget.id)
      setScripts(updated)
      showToast('Script eliminado exitosamente.', 'success')
    } catch {
      showToast('No se pudo eliminar el script.', 'danger')
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
          <p className="view-description">Scripts de creación de base de datos, usuario y privilegios para MySQL.</p>
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
                  <th>Host</th>
                  <th>Privilegios</th>
                  <th>Preset</th>
                  <th>Codificación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {scripts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      {loading ? 'Cargando…' : 'No hay scripts registrados — usa "Nueva" para agregar el primero.'}
                    </td>
                  </tr>
                ) : (
                  scripts.map((script) => (
                    <tr key={script.id}>
                      <td>{script.dbName}</td>
                      <td>{script.userName}</td>
                      <td>{script.host}</td>
                      <td>{script.privileges}</td>
                      <td>{script.preset}</td>
                      <td>{script.charset}</td>
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
                            Generar .sql
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
