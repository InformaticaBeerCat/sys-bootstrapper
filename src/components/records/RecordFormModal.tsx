import { useState } from 'react'
import { Modal } from '../modals/Modal'
import { emptyRecordValues, type ToolConfig } from '../../data/tools'

interface RecordFormModalProps {
  tool: ToolConfig
  mode: 'create' | 'edit'
  initialValues?: Record<string, string>
  onCancel: () => void
  onSave: (values: Record<string, string>) => void
}

export function RecordFormModal({ tool, mode, initialValues, onCancel, onSave }: RecordFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => initialValues ?? emptyRecordValues(tool))

  function handleChange(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }))
  }

  return (
    <Modal
      title={mode === 'create' ? `Nuevo registro — ${tool.name}` : `Editar registro — ${tool.name}`}
      onClose={onCancel}
      size="lg"
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => requestClose(() => onSave(values))}>
            {mode === 'create' ? 'Crear' : 'Guardar cambios'}
          </button>
        </>
      )}
    >
      <div className={`form-row${tool.fields.length === 1 ? ' form-row-1' : ''}`}>
        {tool.fields.map((field) => (
          <div className="form-group" key={field.label}>
            <label className="form-label">{field.label}</label>
            <input
              className="text-input"
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              value={values[field.label] ?? ''}
              onChange={(event) => handleChange(field.label, event.target.value)}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}
