import { useEffect, useState } from 'react'
import type { NginxServerInput, NginxSSLMode } from '../../../electron/shared/http-servers/nginx'
import { Modal } from '../modals/Modal'

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface NginxFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: NginxServerInput
  onCancel: () => void
  onSave: (values: NginxServerInput) => void
}

function validate(values: NginxServerInput): string | null {
  const domainsList = values.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)

  if (domainsList.length === 0) return 'Debes ingresar al menos un dominio.'
  if (domainsList.some((domain) => !DOMAIN_REGEX.test(domain))) {
    return 'Todos los dominios deben tener formato válido (ej: midominio.com).'
  }
  if (!values.http && !values.https) return 'Debes habilitar HTTP (80), HTTPS (443) o ambos.'
  if (!values.isProxy && !values.path.trim()) return 'El path del sitio (root) es obligatorio.'
  if (values.isProxy && !values.proxyTarget.trim()) return 'El destino del proxy_pass es obligatorio.'
  if (values.ssl === 'custom' && values.https) {
    if (!values.sslCustomCert?.trim() || !values.sslCustomKey?.trim()) {
      return 'Debes ingresar la ruta del certificado y la clave privada.'
    }
  }
  return null
}

const EMPTY_VALUES: NginxServerInput = {
  domains: '',
  http: true,
  https: false,
  path: '/var/www/html',
  ssl: 'certbot',
  sslCustomCert: '',
  sslCustomKey: '',
  redirect: false,
  isProxy: false,
  proxyTarget: ''
}

export function NginxFormModal({ mode, initialValues, onCancel, onSave }: NginxFormModalProps) {
  const [values, setValues] = useState<NginxServerInput>(initialValues ?? EMPTY_VALUES)

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev }
      if (!next.https) {
        next.redirect = false
        if (next.ssl !== 'certbot') next.ssl = 'certbot'
      }
      if (next.ssl !== 'custom') {
        next.sslCustomCert = ''
        next.sslCustomKey = ''
      }
      if (next.isProxy) {
        next.path = ''
      } else if (!next.path) {
        next.path = '/var/www/html'
      }
      if (!next.isProxy) {
        next.proxyTarget = ''
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.https, values.ssl, values.isProxy])

  const error = validate(values)
  const showSslCustom = values.ssl === 'custom' && values.https

  function update<K extends keyof NginxServerInput>(key: K, value: NginxServerInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal
      title={mode === 'create' ? 'Nueva configuración Nginx' : 'Editar configuración Nginx'}
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
          <label className="form-label">Dominios / server_name (separados por coma)</label>
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
        <label className="check-row">
          <input type="checkbox" checked={values.http} onChange={(event) => update('http', event.target.checked)} />
          Habilitar HTTP (80)
        </label>
        <label className="check-row">
          <input type="checkbox" checked={values.https} onChange={(event) => update('https', event.target.checked)} />
          Habilitar HTTPS (443)
        </label>
      </div>

      <div className="form-row">
        <div>
          <label className="radio-row">
            <input type="radio" checked={!values.isProxy} onChange={() => update('isProxy', false)} />
            Servir archivos estáticos (root)
          </label>
          <label className="radio-row">
            <input type="radio" checked={values.isProxy} onChange={() => update('isProxy', true)} />
            Usar proxy inverso (proxy_pass)
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
            disabled={values.isProxy}
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
            disabled={!values.isProxy}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Certificado SSL</label>
          <select
            className="text-input"
            value={values.ssl}
            onChange={(event) => update('ssl', event.target.value as NginxSSLMode)}
            disabled={!values.https}
          >
            <option value="certbot">Certbot (Let's Encrypt)</option>
            <option value="snakeoil">Snakeoil (por defecto)</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <label className="check-row" style={{ alignSelf: 'end', opacity: values.https ? 1 : 0.5 }}>
          <input
            type="checkbox"
            checked={values.redirect}
            onChange={(event) => update('redirect', event.target.checked)}
            disabled={!values.https}
          />
          Redirigir HTTP a HTTPS
        </label>
      </div>

      {showSslCustom && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ruta del certificado (.crt/.pem)</label>
            <input
              className="text-input"
              type="text"
              placeholder="Ej: /etc/ssl/certs/misitio.pem"
              value={values.sslCustomCert ?? ''}
              onChange={(event) => update('sslCustomCert', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ruta de la clave privada (.key)</label>
            <input
              className="text-input"
              type="text"
              placeholder="Ej: /etc/ssl/private/misitio.key"
              value={values.sslCustomKey ?? ''}
              onChange={(event) => update('sslCustomKey', event.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </Modal>
  )
}
