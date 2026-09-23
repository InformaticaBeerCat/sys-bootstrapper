import { useEffect, useState } from 'react'
import type { ApacheServerInput, ApacheSSLMode } from '../../../electron/shared/http-servers/apache'
import { useI18n } from '../../contexts/I18nContext'
import type { Dictionary } from '../../i18n'
import { Modal } from '../modals/Modal'

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface ApacheFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: ApacheServerInput
  onCancel: () => void
  onSave: (values: ApacheServerInput) => void
}

function validate(values: ApacheServerInput, t: Dictionary): string | null {
  const domainsList = values.domains
    .split(',')
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)

  if (domainsList.length === 0) return t.httpServer.validation.domainRequired
  if (domainsList.some((domain) => !DOMAIN_REGEX.test(domain))) {
    return t.httpServer.validation.domainFormat
  }
  if (!values.http && !values.https) return t.httpServer.validation.protocolRequired
  if (!values.isProxy && !values.path.trim()) return t.apache.pathRequired
  if (values.isProxy && !values.proxyTarget.trim()) return t.apache.proxyRequired
  if (values.ssl === 'custom' && values.https) {
    if (!values.sslCustomCert?.trim() || !values.sslCustomKey?.trim()) {
      return t.httpServer.validation.certRequired
    }
  }
  return null
}

const EMPTY_VALUES: ApacheServerInput = {
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

export function ApacheFormModal({ mode, initialValues, onCancel, onSave }: ApacheFormModalProps) {
  const { t } = useI18n()
  const [values, setValues] = useState<ApacheServerInput>(initialValues ?? EMPTY_VALUES)

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

  const error = validate(values, t)
  const showSslCustom = values.ssl === 'custom' && values.https

  function update<K extends keyof ApacheServerInput>(key: K, value: ApacheServerInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal
      title={mode === 'create' ? t.httpServer.newTitle('Apache') : t.httpServer.editTitle('Apache')}
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
        <label className="check-row">
          <input type="checkbox" checked={values.http} onChange={(event) => update('http', event.target.checked)} />
          {t.httpServer.enableHttp}
        </label>
        <label className="check-row">
          <input type="checkbox" checked={values.https} onChange={(event) => update('https', event.target.checked)} />
          {t.httpServer.enableHttps}
        </label>
      </div>

      <div className="form-row">
        <div>
          <label className="radio-row">
            <input type="radio" checked={!values.isProxy} onChange={() => update('isProxy', false)} />
            {t.apache.useDocumentRoot}
          </label>
          <label className="radio-row">
            <input type="radio" checked={values.isProxy} onChange={() => update('isProxy', true)} />
            {t.apache.useReverseProxy}
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.apache.pathInput}</label>
          <input
            className="text-input"
            type="text"
            placeholder={t.httpServer.pathPlaceholder}
            value={values.path}
            onChange={(event) => update('path', event.target.value)}
            disabled={values.isProxy}
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
            disabled={!values.isProxy}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.httpServer.sslCertificate}</label>
          <select
            className="text-input"
            value={values.ssl}
            onChange={(event) => update('ssl', event.target.value as ApacheSSLMode)}
            disabled={!values.https}
          >
            <option value="certbot">{t.httpServer.sslModes.certbot}</option>
            <option value="snakeoil">{t.httpServer.sslModes.snakeoil}</option>
            <option value="custom">{t.httpServer.sslModes.custom}</option>
          </select>
        </div>
        <label className="check-row" style={{ alignSelf: 'end', opacity: values.https ? 1 : 0.5 }}>
          <input
            type="checkbox"
            checked={values.redirect}
            onChange={(event) => update('redirect', event.target.checked)}
            disabled={!values.https}
          />
          {t.httpServer.redirectToHttps}
        </label>
      </div>

      {showSslCustom && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t.httpServer.certPathInput}</label>
            <input
              className="text-input"
              type="text"
              placeholder={t.httpServer.certPathPlaceholder}
              value={values.sslCustomCert ?? ''}
              onChange={(event) => update('sslCustomCert', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t.httpServer.keyPathInput}</label>
            <input
              className="text-input"
              type="text"
              placeholder={t.httpServer.keyPathPlaceholder}
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
