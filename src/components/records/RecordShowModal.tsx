import { Modal } from '../modals/Modal'
import type { ToolConfig, ToolRecord } from '../../data/tools'

interface RecordShowModalProps {
  tool: ToolConfig
  record: ToolRecord
  onClose: () => void
}

export function RecordShowModal({ tool, record, onClose }: RecordShowModalProps) {
  const { Logo } = tool

  return (
    <Modal
      title={`${tool.name} — Detalle del registro`}
      onClose={onClose}
      size="lg"
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          Cerrar
        </button>
      )}
    >
      <div className="record-meta">
        <Logo size={20} color={tool.brandColor} title={tool.name} />
        <span className="text-xs text-muted">Creado {new Date(record.createdAt).toLocaleString()}</span>
      </div>

      <div className="record-grid">
        {tool.fields.map((field) => (
          <div className="record-grid-item" key={field.label}>
            <div className="record-grid-label">{field.label}</div>
            <div className="record-grid-value">
              {field.type === 'password' ? '••••••••' : record.values[field.label] || '—'}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
