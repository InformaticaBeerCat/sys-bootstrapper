import type { MongoDBScript } from '../../../electron/shared/databases/mongodb'
import { Modal } from '../modals/Modal'

interface MongoDBShowModalProps {
  script: MongoDBScript
  onClose: () => void
}

export function MongoDBShowModal({ script, onClose }: MongoDBShowModalProps) {
  return (
    <Modal
      title="MongoDB — Detalle del script"
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
          <div className="record-grid-label">Base de autenticación</div>
          <div className="record-grid-value">{script.authDb}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{script.preset}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Roles</div>
          <div className="record-grid-value">{script.roles}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">bindIp</div>
          <div className="record-grid-value">{script.bindIp}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Colección inicial</div>
          <div className="record-grid-value">{script.createInitialCollection ? 'Sí' : 'No'}</div>
        </div>
      </div>
    </Modal>
  )
}
