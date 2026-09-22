import { useState } from 'react'
import { createSeedRecord, type ToolConfig, type ToolRecord } from '../../data/tools'
import { IconEdit, IconEye, IconPlus, IconTable, IconTools, IconTrash } from '../../icons'
import { ConfirmModal } from '../modals/ConfirmModal'
import { RecordFormModal } from './RecordFormModal'
import { RecordShowModal } from './RecordShowModal'

interface ToolRecordsViewProps {
  tool: ToolConfig
}

type FormState = { mode: 'create' } | { mode: 'edit'; record: ToolRecord }

export function ToolRecordsView({ tool }: ToolRecordsViewProps) {
  const { Logo } = tool
  const [records, setRecords] = useState<ToolRecord[]>(() => [createSeedRecord(tool)])
  const [formState, setFormState] = useState<FormState | null>(null)
  const [showRecord, setShowRecord] = useState<ToolRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ToolRecord | null>(null)

  function handleSave(values: Record<string, string>) {
    if (formState?.mode === 'edit') {
      const editId = formState.record.id
      setRecords((prev) => prev.map((record) => (record.id === editId ? { ...record, values } : record)))
    } else {
      setRecords((prev) => [...prev, { id: crypto.randomUUID(), createdAt: Date.now(), values }])
    }
    setFormState(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    setRecords((prev) => prev.filter((record) => record.id !== targetId))
    setDeleteTarget(null)
  }

  return (
    <div className="view view-wide">
      <div className="tool-header">
        <span
          className="tool-logo"
          style={{ background: `${tool.brandColor}22`, boxShadow: `inset 0 0 0 1px ${tool.brandColor}55` }}
        >
          <Logo size={30} color={tool.brandColor} title={tool.name} />
        </span>
        <div>
          <h1 className="view-title">{tool.name}</h1>
          <p className="view-description">{tool.tagline}</p>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <h2 className="panel-title">
            <IconTable />
            Registros
          </h2>
          <div className="comp-row">
            <span className="badge badge-neutral">{records.length} registro(s)</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormState({ mode: 'create' })}>
              <IconPlus />
              Nuevo
            </button>
          </div>
        </div>

        <div className="panel-body">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {tool.fields.map((field) => (
                    <th key={field.label}>{field.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={tool.fields.length + 1} className="table-empty">
                      Sin registros todavía — usa "Nuevo" para agregar el primero.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      {tool.fields.map((field) => (
                        <td key={field.label}>
                          {field.type === 'password' ? '••••••••' : record.values[field.label] || '—'}
                        </td>
                      ))}
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-xs" onClick={() => setShowRecord(record)}>
                            <IconEye />
                            Ver
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            onClick={() => setFormState({ mode: 'edit', record })}
                          >
                            <IconEdit />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteTarget(record)}
                            aria-label="Eliminar registro"
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

      <div className="panel">
        <h2 className="panel-title">
          <IconTools />
          Utilidades
          <span className="badge badge-neutral">Próximamente</span>
        </h2>
        <p className="panel-hint">Generadores y acciones específicas para {tool.name} llegarán acá.</p>

        <div className="comp-row">
          <button type="button" className="btn" disabled>
            Generar configuración
          </button>
          <button type="button" className="btn" disabled>
            Probar conexión
          </button>
        </div>
      </div>

      {formState && (
        <RecordFormModal
          tool={tool}
          mode={formState.mode}
          initialValues={formState.mode === 'edit' ? formState.record.values : undefined}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {showRecord && <RecordShowModal tool={tool} record={showRecord} onClose={() => setShowRecord(null)} />}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar registro"
          message={`Esto solo lo quita de esta vista de ejemplo — no hay datos reales de por medio. ¿Eliminar este registro de ${tool.name}?`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
