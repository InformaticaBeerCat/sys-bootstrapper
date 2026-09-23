import { useEffect, useState } from 'react'
import type { CaddyMode, CaddyServerInput, CaddyTlsMode } from '../../../electron/shared/http-servers/caddy'
import { Modal } from '../modals/Modal'

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface CaddyFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: CaddyServerInput
  onCancel: () => void
  onSave: (values: CaddyServerInput) => void
}

function validate(values: CaddyServerInput): string | null {
  const domainsList = values.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)

  if (domainsList.length === 0) return 'Debes ingresar al menos un dominio.'
  if (domainsList.some((domain) => !DOMAIN_REGEX.test(domain))) {
    return 'Todos los dominios deben tener formato válido (ej: midominio.com).'
  }
  if (values.mode === 'static' && !values.path.trim()) return 'El path del sitio (root) es obligatorio.'
  if (values.mode === 'proxy' && !values.proxyTarget.trim()) return 'El destino del reverse_proxy es obligatorio.'
  if (values.tls === 'custom' && (!values.tlsCustomCert?.trim() || !values.tlsCustomKey?.trim())) {
    return 'Debes ingresar la ruta del certificado y la clave privada.'
  }
  return null
}

const EMPTY_VALUES: CaddyServerInput = {
  domains: '',
  mode: 'static',
  path: '/var/www/html',
  proxyTarget: '',
  tls: 'auto',
  tlsCustomCert: '',
  tlsCustomKey: '',
  encodeGzip: true
}

export function CaddyFormModal({ mode, initialValues, onCancel, onSave }: CaddyFormModalProps) {
  const [values, setValues] = useState<CaddyServerInput>(initialValues ?? EMPTY_VALUES)

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev }
      if (next.tls !== 'custom') {
        next.tlsCustomCert = ''
        next.tlsCustomKey = ''
      }
      if (next.mode === 'proxy') {
        next.path = ''
      } else if (!next.path) {
        next.path = '/var/www/html'
      }
      if (next.mode === 'static') {
        next.proxyTarget = ''
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.tls, values.mode])

  const error = validate(values)
  const showTlsCustom = values.tls === 'custom'

  function update<K extends keyof CaddyServerInput>(key: K, value: CaddyServerInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal
      title={mode === 'create' ? 'Nueva configuración Caddy' : 'Editar configuración Caddy'}
      onClose={onCancel}
      size="lg"
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!error}
            onClick={() => requestClose(() => onSave(values))}
          >
            {mode === 'create' ? 'Crear' : 'Guardar cambios'}
          </button>
        </>
      )}
    >
      <div className="form-row form-row-1">
        <div className="form-group">
          <label className="form-label">Dominios (separados por coma)</label>
          <input
            className="text-input"
            type="text"
            placeholder="Ej: midominio.com, www.otrodominio.com"
            value={values.domains}
            onChange={(event) => update('domains', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label className="radio-row">
            <input type="radio" checked={values.mode === 'static'} onChange={() => update('mode', 'static' as CaddyMode)} />
            Servir archivos estáticos (root * + file_server)
          </label>
          <label className="radio-row">
            <input type="radio" checked={values.mode === 'proxy'} onChange={() => update('mode', 'proxy' as CaddyMode)} />
            Usar proxy inverso (reverse_proxy)
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Path del sitio (root)</label>
          <input
            className="text-input"
            type="text"
            placeholder="Ej: /var/www/html, /srv/misitio"
            value={values.path}
            onChange={(event) => update('path', event.target.value)}
            disabled={values.mode === 'proxy'}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Proxy destino (IP:PUERTO)</label>
          <input
            className="text-input"
            type="text"
            placeholder="Ej: 127.0.0.1:3000, api.midominio.com:8080"
            value={values.proxyTarget}
            onChange={(event) => update('proxyTarget', event.target.value)}
            disabled={values.mode === 'static'}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">TLS / HTTPS</label>
          <select
            className="text-input"
            value={values.tls}
            onChange={(event) => update('tls', event.target.value as CaddyTlsMode)}
          >
            <option value="auto">Automático (Let's Encrypt, por defecto)</option>
            <option value="internal">Interno (autofirmado, para dominios locales)</option>
            <option value="custom">Personalizado</option>
            <option value="off">Desactivado (solo HTTP)</option>
          </select>
        </div>
        <label className="check-row" style={{ alignSelf: 'end' }}>
          <input
            type="checkbox"
            checked={values.encodeGzip}
            onChange={(event) => update('encodeGzip', event.target.checked)}
          />
          Comprimir respuestas (encode zstd gzip)
        </label>
      </div>

      {showTlsCustom && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ruta del certificado (.crt/.pem)</label>
            <input
              className="text-input"
              type="text"
              placeholder="Ej: /etc/ssl/certs/misitio.pem"
              value={values.tlsCustomCert ?? ''}
              onChange={(event) => update('tlsCustomCert', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ruta de la clave privada (.key)</label>
            <input
              className="text-input"
              type="text"
              placeholder="Ej: /etc/ssl/private/misitio.key"
              value={values.tlsCustomKey ?? ''}
              onChange={(event) => update('tlsCustomKey', event.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
