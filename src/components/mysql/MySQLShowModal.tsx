import type { MySQLScript } from '../../../electron/shared/databases/mysql'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'

interface MySQLShowModalProps {
  script: MySQLScript
  onClose: () => void
}

export function MySQLShowModal({ script, onClose }: MySQLShowModalProps) {
  const { t, locale } = useI18n()

  return (
    <Modal
      title={t.database.detailTitle('MySQL')}
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
          <div className="record-grid-label">Host</div>
          <div className="record-grid-value">{script.host}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{t.database.presets[script.preset]}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.privileges}</div>
          <div className="record-grid-value">{script.privileges}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.encoding}</div>
          <div className="record-grid-value">{script.charset}</div>
        </div>
      </div>
    </Modal>
  )
}
