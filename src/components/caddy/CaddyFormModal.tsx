import { useEffect, useState } from 'react'
import type { CaddyMode, CaddyServerInput, CaddyTlsMode } from '../../../electron/shared/http-servers/caddy'
import { useI18n } from '../../contexts/I18nContext'
import type { Dictionary } from '../../i18n'
import { Modal } from '../modals/Modal'

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface CaddyFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: CaddyServerInput
  onCancel: () => void
  onSave: (values: CaddyServerInput) => void
}

function validate(values: CaddyServerInput, t: Dictionary): string | null {
  const domainsList = values.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)

  if (domainsList.length === 0) return t.httpServer.validation.domainRequired
  if (domainsList.some((domain) => !DOMAIN_REGEX.test(domain))) {
    return t.httpServer.validation.domainFormat
  }
  if (values.mode === 'static' && !values.path.trim()) return t.caddy.pathRequired
  if (values.mode === 'proxy' && !values.proxyTarget.trim()) return t.caddy.proxyRequired
  if (values.tls === 'custom' && (!values.tlsCustomCert?.trim() || !values.tlsCustomKey?.trim())) {
    return t.httpServer.validation.certRequired
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
  const { t } = useI18n()
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

  const error = validate(values, t)
  const showTlsCustom = values.tls === 'custom'

  function update<K extends keyof CaddyServerInput>(key: K, value: CaddyServerInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal
      title={mode === 'create' ? t.httpServer.newTitle('Caddy') : t.httpServer.editTitle('Caddy')}
      onClose={onCancel}
      size="lg"
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!error}
            onClick={() => requestClose(() => onSave(values))}
          >
            {mode === 'create' ? t.common.create : t.common.saveChanges}
          </button>
        </>
      )}
    >
      <div className="form-row form-row-1">
        <div className="form-group">
          <label className="form-label">{t.httpServer.domainsInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.httpServer.domainsPlaceholder}
            value={values.domains}
            onChange={(event) => update('domains', event.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label className="radio-row">
            <input type="radio" checked={values.mode === 'static'} onChange={() => update('mode', 'static' as CaddyMode)} />
            {t.caddy.serveStatic}
          </label>
          <label className="radio-row">
            <input type="radio" checked={values.mode === 'proxy'} onChange={() => update('mode', 'proxy' as CaddyMode)} />
            {t.caddy.useReverseProxy}
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.caddy.pathInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.httpServer.pathPlaceholder}
            value={values.path}
            onChange={(event) => update('path', event.target.value)}
            disabled={values.mode === 'proxy'}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t.httpServer.proxyTargetInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.httpServer.proxyTargetPlaceholder}
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
            <option value="auto">{t.caddy.tlsOptions.auto}</option>
            <option value="internal">{t.caddy.tlsOptions.internal}</option>
            <option value="custom">{t.caddy.tlsOptions.custom}</option>
            <option value="off">{t.caddy.tlsOptions.off}</option>
          </select>
        </div>
        <label className="check-row" style={{ alignSelf: 'end' }}>
          <input
            type="checkbox"
            checked={values.encodeGzip}
            onChange={(event) => update('encodeGzip', event.target.checked)}
          />
          {t.caddy.compressResponses}
        </label>
      </div>

      {showTlsCustom && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t.httpServer.certPathInput}</label>
            <input
              className="text-input"
              type="text"
              placeholder={t.httpServer.certPathPlaceholder}
              value={values.tlsCustomCert ?? ''}
              onChange={(event) => update('tlsCustomCert', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t.httpServer.keyPathInput}</label>
            <input
              className="text-input"
              type="text"
              placeholder={t.httpServer.keyPathPlaceholder}
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
