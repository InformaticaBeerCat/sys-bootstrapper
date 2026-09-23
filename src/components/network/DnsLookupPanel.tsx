import { useState, type FormEvent } from 'react'
import { DNS_QUERY_TYPES, type DnsLookupResult, type DnsQueryType } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconMagnifyingGlass, IconRefresh } from '../../icons'
import { describeNetError } from './format'
import { CopyButton } from './widgets'

const PRESET_SERVERS = [
  { value: '1.1.1.1', label: 'Cloudflare (1.1.1.1)' },
  { value: '8.8.8.8', label: 'Google (8.8.8.8)' },
  { value: '9.9.9.9', label: 'Quad9 (9.9.9.9)' }
]

const CUSTOM_SERVER = 'custom'

export function DnsLookupPanel() {
  const { t } = useI18n()
  const [hostname, setHostname] = useState('')
  const [type, setType] = useState<DnsQueryType>('A')
  const [serverChoice, setServerChoice] = useState('')
  const [customServer, setCustomServer] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DnsLookupResult | null>(null)

  // SYSTEM y CHROMIUM usan sus propios resolvers; elegir servidor no aplica.
  const usesServer = type !== 'SYSTEM' && type !== 'CHROMIUM'
  const typeLabels = t.networkView.dnsTypeLabels as Partial<Record<DnsQueryType, string>>

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!hostname.trim()) return setValidationError(t.networkView.validation.hostRequired)
    if (usesServer && serverChoice === CUSTOM_SERVER && !customServer.trim()) {
      return setValidationError(t.networkView.validation.serverRequired)
    }
    setValidationError(null)
    setLoading(true)
    try {
      const server = !usesServer ? null : serverChoice === CUSTOM_SERVER ? customServer.trim() : serverChoice || null
      setResult(await window.sysBootstrapper.network.dnsLookup({ hostname: hostname.trim(), type, server }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">
        <IconMagnifyingGlass />
        {t.networkView.dnsLookup}
      </h2>
      <p className="panel-hint">{t.networkView.dnsLookupHint}</p>

      <form className="net-form" onSubmit={handleSubmit}>
        <div className="form-group net-grow">
          <label className="form-label" htmlFor="dns-host">
            {t.networkView.domainInput}
          </label>
          <input
            id="dns-host"
            className="text-input"
            placeholder={t.networkView.domainPlaceholder}
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="dns-type">
            {t.networkView.recordType}
          </label>
          <select
            id="dns-type"
            className="text-input"
            value={type}
            onChange={(event) => setType(event.target.value as DnsQueryType)}
          >
            {DNS_QUERY_TYPES.map((option) => (
              <option key={option} value={option}>
                {typeLabels[option] ?? option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="dns-server">
            {t.networkView.dnsServer}
          </label>
          <select
            id="dns-server"
            className="text-input"
            value={serverChoice}
            onChange={(event) => setServerChoice(event.target.value)}
            disabled={!usesServer}
          >
            <option value="">{t.networkView.dnsServerSystem}</option>
            {PRESET_SERVERS.map((server) => (
              <option key={server.value} value={server.value}>
                {server.label}
              </option>
            ))}
            <option value={CUSTOM_SERVER}>{t.networkView.dnsServerCustom}</option>
          </select>
        </div>
        {usesServer && serverChoice === CUSTOM_SERVER && (
          <div className="form-group">
            <label className="form-label" htmlFor="dns-custom-server">
              IP
            </label>
            <input
              id="dns-custom-server"
              className="text-input"
              placeholder={t.networkView.dnsServerPlaceholder}
              value={customServer}
              onChange={(event) => setCustomServer(event.target.value)}
              spellCheck={false}
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <IconRefresh className="net-spin" /> : <IconMagnifyingGlass />}
          {t.networkView.query}
        </button>
      </form>
      {validationError && <p className="form-error">{validationError}</p>}

      {result && (
        <>
          <div className="net-result-meta">
            {result.error ? (
              <span className="badge badge-danger">{describeNetError(result.error, t)}</span>
            ) : (
              <span className="badge badge-success">{t.networkView.recordsFound(result.records.length)}</span>
            )}
            <span>{t.networkView.answeredBy(result.server, result.elapsedMs)}</span>
            {result.records.length > 0 && <CopyButton text={result.records.join('\n')} />}
          </div>
          {result.records.length > 0 && (
            <ul className="net-records">
              {result.records.map((record, index) => (
                <li key={`${record}-${index}`}>{record}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
