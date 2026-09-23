import type { PostgreSQLScript } from '../../../electron/shared/databases/postgresql'
import { Modal } from '../modals/Modal'

interface PostgreSQLShowModalProps {
  script: PostgreSQLScript
  onClose: () => void
}

export function PostgreSQLShowModal({ script, onClose }: PostgreSQLShowModalProps) {
  return (
    <Modal
      title="PostgreSQL — Detalle del script"
      onClose={onClose}
      size="lg"
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          Cerrar
        </button>
      )}
    >
      <div className="record-meta">
        <span className="text-xs text-muted">Creado {new Date(script.createdAt).toLocaleString()}</span>
      </div>

      <div className="record-grid">
        <div className="record-grid-item">
          <div className="record-grid-label">Base de datos</div>
          <div className="record-grid-value">{script.dbName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Usuario (rol)</div>
          <div className="record-grid-value">{script.userName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Contraseña</div>
          <div className="record-grid-value">••••••••</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Conexiones permitidas</div>
          <div className="record-grid-value">{script.allowedHost}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{script.preset}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Privilegios (tablas)</div>
          <div className="record-grid-value">{script.privileges}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Codificación</div>
          <div className="record-grid-value">{script.encoding}</div>
        </div>
      </div>
    </Modal>
  )
}
