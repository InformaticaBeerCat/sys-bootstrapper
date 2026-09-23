import type { MongoDBScript } from '../../../electron/shared/databases/mongodb'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'

interface MongoDBShowModalProps {
  script: MongoDBScript
  onClose: () => void
}

export function MongoDBShowModal({ script, onClose }: MongoDBShowModalProps) {
  const { t, locale } = useI18n()

  return (
    <Modal
      title={t.database.detailTitle('MongoDB')}
      onClose={onClose}
      size="lg"
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          {t.common.close}
        </button>
      )}
    >
      <div className="record-meta">
        <span className="text-xs text-muted">{t.common.createdAt(new Date(script.createdAt).toLocaleString(locale))}</span>
      </div>

      <div className="record-grid">
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.database}</div>
          <div className="record-grid-value">{script.dbName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.user}</div>
          <div className="record-grid-value">{script.userName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.password}</div>
          <div className="record-grid-value">••••••••</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.mongodb.authDb}</div>
          <div className="record-grid-value">{script.authDb}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{t.database.presets[script.preset]}</div>
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
          <div className="record-grid-label">{t.mongodb.initialCollection}</div>
          <div className="record-grid-value">{script.createInitialCollection ? t.common.yes : t.common.no}</div>
        </div>
      </div>
    </Modal>
  )
}
