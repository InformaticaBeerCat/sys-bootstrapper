import type { PostgreSQLScript } from '../../../electron/shared/databases/postgresql'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'

interface PostgreSQLShowModalProps {
  script: PostgreSQLScript
  onClose: () => void
}

export function PostgreSQLShowModal({ script, onClose }: PostgreSQLShowModalProps) {
  const { t, locale } = useI18n()

  return (
    <Modal
      title={t.database.detailTitle('PostgreSQL')}
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
          <div className="record-grid-label">{t.postgresql.userRole}</div>
          <div className="record-grid-value">{script.userName}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.password}</div>
          <div className="record-grid-value">••••••••</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.postgresql.allowedConnections}</div>
          <div className="record-grid-value">{script.allowedHost}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Preset</div>
          <div className="record-grid-value">{t.database.presets[script.preset]}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.postgresql.tablePrivileges}</div>
          <div className="record-grid-value">{script.privileges}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{t.database.encoding}</div>
          <div className="record-grid-value">{script.encoding}</div>
        </div>
      </div>
    </Modal>
  )
}
