import type { NginxServer } from '../../../electron/shared/http-servers/nginx'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'

interface NginxShowModalProps {
  server: NginxServer
  onClose: () => void
}

export function NginxShowModal({ server, onClose }: NginxShowModalProps) {
  const { t, locale } = useI18n()

  return (
    <Modal
      title={t.httpServer.detailTitle('Nginx')}
      onClose={onClose}
      size="lg"
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          {t.common.close}
        </button>
      )}
    >
      <div className="record-meta">
        <span className="text-xs text-muted">{t.common.createdAt(new Date(server.createdAt).toLocaleString(locale))}</span>
      </div>

      <div className="record-grid">
        <div className="record-grid-item">
          <div className="record-grid-label">{t.nginx.domains}</div>
          <div className="record-grid-value">{server.domains}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">HTTP (80)</div>
          <div className="record-grid-value">{server.http ? t.common.enabled : '—'}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">HTTPS (443)</div>
          <div className="record-grid-value">{server.https ? t.common.enabled : '—'}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Redirect HTTP → HTTPS</div>
          <div className="record-grid-value">{server.redirect ? '301 → https' : t.common.no}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{server.isProxy ? 'proxy_pass' : 'root'}</div>
          <div className="record-grid-value">
            {server.isProxy ? `http://${server.proxyTarget}` : server.path || '—'}
          </div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">SSL</div>
          <div className="record-grid-value">{server.https ? t.httpServer.sslModes[server.ssl] : '—'}</div>
        </div>
        {server.https && server.ssl === 'custom' && (
          <>
            <div className="record-grid-item">
              <div className="record-grid-label">{t.httpServer.certificate}</div>
              <div className="record-grid-value">{server.sslCustomCert || '—'}</div>
            </div>
            <div className="record-grid-item">
              <div className="record-grid-label">{t.httpServer.privateKey}</div>
              <div className="record-grid-value">{server.sslCustomKey || '—'}</div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
