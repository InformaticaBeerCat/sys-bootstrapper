import type { MySQLScript } from '../../../electron/shared/databases/mysql'
import { Modal } from '../modals/Modal'

interface MySQLShowModalProps {
  script: MySQLScript
  onClose: () => void
}

export function MySQLShowModal({ script, onClose }: MySQLShowModalProps) {
  return (
    <Modal
      title="MySQL — Detalle del script"
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
          <div className="record-grid-label">Usuario</div>
          <div className="record-grid-value">{script.userName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Contraseña</div>
          <div className="record-grid-value">••••••••</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Host</div>
          <div className="record-grid-value">{script.host}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{script.preset}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Privilegios</div>
          <div className="record-grid-value">{script.privileges}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Codificación</div>
          <div className="record-grid-value">{script.charset}</div>
        </div>
      </div>
    </Modal>
  )
}
