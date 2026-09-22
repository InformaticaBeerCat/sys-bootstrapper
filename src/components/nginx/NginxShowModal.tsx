import type { NginxServer } from '../../../electron/shared/http-servers/nginx'
import { Modal } from '../modals/Modal'

const SSL_LABELS: Record<NginxServer['ssl'], string> = {
  certbot: "Certbot (Let's Encrypt)",
  snakeoil: 'Snakeoil (por defecto)',
  custom: 'Personalizado'
}

interface NginxShowModalProps {
  server: NginxServer
  onClose: () => void
}

export function NginxShowModal({ server, onClose }: NginxShowModalProps) {
  return (
    <Modal
      title="Nginx — Detalle de la configuración"
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
          <div className="record-grid-label">Dominios / server_name</div>
          <div className="record-grid-value">{server.domains}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">HTTP (80)</div>
          <div className="record-grid-value">{server.http ? 'Habilitado' : '—'}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">HTTPS (443)</div>
          <div className="record-grid-value">{server.https ? 'Habilitado' : '—'}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">Redirect HTTP → HTTPS</div>
          <div className="record-grid-value">{server.redirect ? '301 → https' : 'No'}</div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">{server.isProxy ? 'proxy_pass' : 'root'}</div>
          <div className="record-grid-value">
            {server.isProxy ? `http://${server.proxyTarget}` : server.path || '—'}
          </div>
        </div>
        <div className="record-grid-item">
          <div className="record-grid-label">SSL</div>
          <div className="record-grid-value">{server.https ? SSL_LABELS[server.ssl] : '—'}</div>
        </div>
        {server.https && server.ssl === 'custom' && (
          <>
            <div className="record-grid-item">
              <div className="record-grid-label">Certificado</div>
              <div className="record-grid-value">{server.sslCustomCert || '—'}</div>
            </div>
            <div className="record-grid-item">
              <div className="record-grid-label">Clave privada</div>
              <div className="record-grid-value">{server.sslCustomKey || '—'}</div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
