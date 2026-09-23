import { useState, type FormEvent } from 'react'
import type { TlsCertificateInfo, TlsInspectResult } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconAlert, IconCheckCircle, IconLock, IconRefresh, IconXCircle } from '../../icons'
import { describeNetError, formatDate } from './format'
import { CopyableValue } from './widgets'

const MAX_VISIBLE_NAMES = 12
/** Umbral típico de alerta de renovación (certbot renueva a los 30 días). */
const EXPIRY_WARNING_DAYS = 30

function DaysBadge({ days }: { days: number }) {
  const { t } = useI18n()
  const tone = days < 0 ? 'badge-danger' : days < EXPIRY_WARNING_DAYS ? 'badge-warning' : 'badge-success'
  return <span className={`badge ${tone}`}>{t.networkView.daysRemaining(days)}</span>
}

function LeafCertificate({ cert }: { cert: TlsCertificateInfo }) {
  const { t, locale } = useI18n()
  const hiddenNames = cert.altNames.length - MAX_VISIBLE_NAMES

  return (
    <dl className="net-kv selectable">
      <dt>{t.networkView.subject}</dt>
      <dd>
        {cert.subject}
        {cert.selfSigned && <span className="badge badge-warning">{t.networkView.selfSigned}</span>}
      </dd>
      <dt>{t.networkView.issuer}</dt>
      <dd>{cert.issuer}</dd>
      <dt>{t.networkView.validFrom}</dt>
      <dd>{formatDate(cert.validFrom, locale)}</dd>
      <dt>{t.networkView.validTo}</dt>
      <dd>
        {formatDate(cert.validTo, locale)}
        <DaysBadge days={cert.daysRemaining} />
      </dd>
      {cert.altNames.length > 0 && (
        <>
          <dt>{t.networkView.altNames}</dt>
          <dd>
            {cert.altNames.slice(0, MAX_VISIBLE_NAMES).map((name) => (
              <span className="badge badge-neutral net-lowercase" key={name}>
                {name}
              </span>
            ))}
            {hiddenNames > 0 && (
              <span className="text-muted text-xs" title={cert.altNames.slice(MAX_VISIBLE_NAMES).join(', ')}>
                {t.networkView.moreNames(hiddenNames)}
              </span>
            )}
          </dd>
        </>
      )}
      <dt>{t.networkView.key}</dt>
      <dd>{cert.key ?? '—'}</dd>
      <dt>{t.networkView.serial}</dt>
      <dd className="mono net-break">{cert.serialNumber}</dd>
      <dt>{t.networkView.fingerprint}</dt>
      <dd className="net-break">
        <CopyableValue value={cert.fingerprint256} />
      </dd>
    </dl>
  )
}

export function TlsInspectPanel() {
  const { t } = useI18n()
  const [host, setHost] = useState('')
  const [port, setPort] = useState('443')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TlsInspectResult | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const portNumber = Number(port)
    if (!host.trim()) return setValidationError(t.networkView.validation.hostRequired)
    if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      return setValidationError(t.networkView.validation.invalidPort)
    }
    setValidationError(null)
    setLoading(true)
    try {
      setResult(await window.sysBootstrapper.network.inspectTls({ host: host.trim(), port: portNumber }))
    } finally {
      setLoading(false)
    }
  }

  const leaf = result?.chain[0] ?? null

  return (
    <div className="panel">
      <h2 className="panel-title">
        <IconLock />
        {t.networkView.tlsInspect}
      </h2>
      <p className="panel-hint">{t.networkView.tlsInspectHint}</p>

      <form className="net-form" onSubmit={handleSubmit}>
        <div className="form-group net-grow">
          <label className="form-label" htmlFor="tls-host">
            {t.networkView.hostInput}
          </label>
          <input
            id="tls-host"
            className="text-input"
            placeholder={t.networkView.domainPlaceholder}
            value={host}
            onChange={(event) => setHost(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="form-group net-narrow">
          <label className="form-label" htmlFor="tls-port">
            {t.networkView.port}
          </label>
          <input
            id="tls-port"
            className="text-input"
            inputMode="numeric"
            value={port}
            onChange={(event) => setPort(event.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <IconRefresh className="net-spin" /> : <IconLock />}
          {t.networkView.inspect}
        </button>
      </form>
      {validationError && <p className="form-error">{validationError}</p>}

      {result &&
        (result.error ? (
          <div className="status-line danger">
            <IconXCircle />
            <span>{describeNetError(result.error, t)}</span>
          </div>
        ) : (
          <>
            <div className={`status-line ${result.authorized ? 'ok' : 'warn'}`}>
              {result.authorized ? <IconCheckCircle /> : <IconAlert />}
              <span>
                {result.authorized
                  ? t.networkView.tlsTrusted
                  : describeNetError(result.authorizationError ?? 'UNKNOWN', t)}
              </span>
            </div>

            <div className="net-result-meta">
              {result.protocol && <span className="badge badge-neutral">{result.protocol}</span>}
              {result.alpn && <span className="badge badge-neutral">ALPN {result.alpn}</span>}
              {result.cipher && <span className="mono">{result.cipher}</span>}
              <span>
                {t.networkView.handshake}: {result.elapsedMs} ms
              </span>
            </div>

            {leaf && (
              <div className="net-subsection">
                <LeafCertificate cert={leaf} />
              </div>
            )}

            {result.chain.length > 1 && (
              <div className="net-subsection">
                <div className="form-label">{t.networkView.chain}</div>
                <ol className="net-chain selectable">
                  {result.chain.map((cert, index) => (
                    <li className="net-chain-item" key={cert.fingerprint256}>
                      <span className="net-chain-index">{index}</span>
                      <div className="net-chain-body">
                        <strong>{cert.subject}</strong>
                        <span className="text-muted text-xs">
                          {cert.selfSigned ? t.networkView.selfSigned : `← ${cert.issuer}`}
                        </span>
                      </div>
                      <DaysBadge days={cert.daysRemaining} />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="net-panel-foot">{t.networkView.trustStoreNote}</p>
          </>
        ))}
    </div>
  )
}
