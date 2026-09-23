import { useState, type FormEvent } from 'react'
import { MAX_PORT_CHECK, parsePortList, type PortCheckResult, type PortState } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconPlug, IconRefresh } from '../../icons'
import { describeNetError } from './format'

const STATE_TONES: Record<PortState, string> = {
  open: 'badge-success',
  closed: 'badge-neutral',
  timeout: 'badge-warning',
  error: 'badge-danger'
}

export function PortCheckPanel() {
  const { t } = useI18n()
  const [host, setHost] = useState('')
  const [portsInput, setPortsInput] = useState('22, 80, 443')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PortCheckResult | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const ports = parsePortList(portsInput)
    if (!host.trim()) return setValidationError(t.networkView.validation.hostRequired)
    if (!ports || ports.length === 0) return setValidationError(t.networkView.validation.invalidPorts)
    if (ports.length > MAX_PORT_CHECK) return setValidationError(t.networkView.validation.tooManyPorts(MAX_PORT_CHECK))
    setValidationError(null)
    setLoading(true)
    try {
      setResult(await window.sysBootstrapper.network.checkPorts({ host: host.trim(), ports }))
    } finally {
      setLoading(false)
    }
  }

  const openCount = result?.results.filter((probe) => probe.state === 'open').length ?? 0
  const hasTimeouts = result?.results.some((probe) => probe.state === 'timeout') ?? false

  return (
    <div className="panel">
      <h2 className="panel-title">
        <IconPlug />
        {t.networkView.portCheck}
      </h2>
      <p className="panel-hint">{t.networkView.portCheckHint(MAX_PORT_CHECK)}</p>

      <form className="net-form" onSubmit={handleSubmit}>
        <div className="form-group net-grow">
          <label className="form-label" htmlFor="port-host">
            {t.networkView.hostInput}
          </label>
          <input
            id="port-host"
            className="text-input"
            placeholder={t.networkView.hostPlaceholder}
            value={host}
            onChange={(event) => setHost(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="form-group net-grow">
          <label className="form-label" htmlFor="port-list">
            {t.networkView.portsInput}
          </label>
          <input
            id="port-list"
            className="text-input"
            placeholder={t.networkView.portsPlaceholder}
            value={portsInput}
            onChange={(event) => setPortsInput(event.target.value)}
            spellCheck={false}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <IconRefresh className="net-spin" /> : <IconPlug />}
          {t.networkView.check}
        </button>
      </form>
      {validationError && <p className="form-error">{validationError}</p>}

      {result && (
        <>
          <div className="net-result-meta">
            {result.error ? (
              <span className="badge badge-danger">{describeNetError(result.error, t)}</span>
            ) : (
              <>
                <span className={`badge ${openCount > 0 ? 'badge-success' : 'badge-neutral'}`}>
                  {t.networkView.openCount(openCount, result.results.length)}
                </span>
                {result.address && result.address !== result.host && (
                  <span className="mono">{t.networkView.resolvedTo(result.address)}</span>
                )}
              </>
            )}
          </div>

          {result.results.length > 0 && (
            <div className="table-wrap selectable net-result-table">
              <table>
                <thead>
                  <tr>
                    <th>{t.networkView.port}</th>
                    <th>{t.networkView.service}</th>
                    <th>{t.networkView.state}</th>
                    <th>{t.networkView.latency}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((probe) => (
                    <tr key={probe.port}>
                      <td className="mono">
                        <strong>{probe.port}</strong>
                      </td>
                      <td>{probe.service ?? <span className="text-muted">—</span>}</td>
                      <td>
                        <span className={`badge ${STATE_TONES[probe.state]}`} title={probe.error ?? undefined}>
                          {t.networkView.portStates[probe.state]}
                        </span>
                      </td>
                      <td className="mono">{probe.latencyMs !== null ? `${probe.latencyMs} ms` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasTimeouts && <p className="net-panel-foot">{t.networkView.timeoutHint}</p>}
        </>
      )}
    </div>
  )
}
