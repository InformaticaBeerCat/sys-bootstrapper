import type { CaddyServer } from '../../../electron/shared/http-servers/caddy'
import { useI18n } from '../../contexts/I18nContext'
import { Modal } from '../modals/Modal'

interface CaddyShowModalProps {
  server: CaddyServer
  onClose: () => void
}

export function CaddyShowModal({ server, onClose }: CaddyShowModalProps) {
  const { t, locale } = useI18n()

  return (
    <Modal
      title={t.httpServer.detailTitle('Caddy')}
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
          <div className="record-grid-label">{t.httpServer.domains}</div>
          <div className="record-grid-value">{server.domains}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{server.mode === 'proxy' ? 'reverse_proxy' : 'root'}</div>
          <div className="record-grid-value">
            {server.mode === 'proxy' ? server.proxyTarget || '—' : server.path || '—'}
          </div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">TLS</div>
          <div className="record-grid-value">{t.caddy.tlsLabels[server.tls]}</div>
        </div>
        {server.tls === 'custom' && (
          <>
            <div className="record-grid-item">
              <div className="record-grid-label">{t.httpServer.certificate}</div>
              <div className="record-grid-value">{server.tlsCustomCert || '—'}</div>
            </div>
            <div className="record-grid-item">
              <div className="record-grid-label">{t.httpServer.privateKey}</div>
              <div className="record-grid-value">{server.tlsCustomKey || '—'}</div>
            </div>
          </>
        )}
        <div className="record-grid-item">
          <div className="record-grid-label">{t.caddy.compressionEncode}</div>
          <div className="record-grid-value">{server.encodeGzip ? 'zstd gzip' : '—'}</div>
        </div>
      </div>
    </Modal>
  )
}
