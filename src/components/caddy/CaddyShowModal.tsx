import type { CaddyServer } from '../../../electron/shared/http-servers/caddy'
import { Modal } from '../modals/Modal'

const TLS_LABELS: Record<CaddyServer['tls'], string> = {
  auto: "Automático (Let's Encrypt)",
  internal: 'Interno (autofirmado)',
  custom: 'Personalizado',
  off: 'Desactivado (solo HTTP)'
}

interface CaddyShowModalProps {
  server: CaddyServer
  onClose: () => void
}

export function CaddyShowModal({ server, onClose }: CaddyShowModalProps) {
  return (
    <Modal
      title="Caddy — Detalle de la configuración"
      onClose={onClose}
      size="lg"
      footer={(requestClose) => (
        <button type="button" className="btn" onClick={() => requestClose()}>
          Cerrar
        </button>
      )}
    >
      <div className="record-meta">
        <span className="text-xs text-muted">Creado {new Date(server.createdAt).toLocaleString()}</span>
      </div>

      <div className="record-grid">
        <div className="record-grid-item">
          <div className="record-grid-label">Dominios</div>
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
          <div className="record-grid-value">{TLS_LABELS[server.tls]}</div>
        </div>
        {server.tls === 'custom' && (
          <>
            <div className="record-grid-item">
              <div className="record-grid-label">Certificado</div>
              <div className="record-grid-value">{server.tlsCustomCert || '—'}</div>
            </div>
            <div className="record-grid-item">
              <div className="record-grid-label">Clave privada</div>
              <div className="record-grid-value">{server.tlsCustomKey || '—'}</div>
            </div>
          </>
        )}
        <div className="record-grid-item">
          <div className="record-grid-label">Compresión (encode)</div>
          <div className="record-grid-value">{server.encodeGzip ? 'zstd gzip' : '—'}</div>
        </div>
      </div>
    </Modal>
  )
}
