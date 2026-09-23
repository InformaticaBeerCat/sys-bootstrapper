import { useCallback, useEffect, useState } from 'react'
import type { ListeningPortsResult, ListeningSocket, SocketExposure } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconInfo, IconPlug } from '../../icons'
import { RefreshButton } from './widgets'

type ProtocolFilter = 'TCP' | 'UDP' | 'ALL'

const EXPOSURE_TONES: Record<SocketExposure, string> = {
  all: 'badge-warning',
  loopback: 'badge-success',
  specific: 'badge-neutral'
}

function matchesQuery(socket: ListeningSocket, query: string): boolean {
  if (!query) return true
  const haystack = [socket.port, socket.address, socket.process, socket.service, ...socket.pids].join(' ').toLowerCase()
  return haystack.includes(query)
}

export function NetworkPortsTab() {
  const { t } = useI18n()
  const [data, setData] = useState<ListeningPortsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [protocol, setProtocol] = useState<ProtocolFilter>('TCP')
  const [onlyExposed, setOnlyExposed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await window.sysBootstrapper.network.getListeningPorts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sockets = data?.sockets ?? []
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = sockets.filter(
    (socket) =>
      (protocol === 'ALL' || socket.protocol === protocol) &&
      (!onlyExposed || socket.exposure === 'all') &&
      matchesQuery(socket, normalizedQuery)
  )
  const tcpCount = sockets.filter((socket) => socket.protocol === 'TCP').length
  const udpCount = sockets.length - tcpCount
  const exposedTcp = sockets.filter((socket) => socket.protocol === 'TCP' && socket.exposure === 'all').length
  const showUser = sockets.some((socket) => socket.user)
  const columns = 7 + Number(showUser)

  return (
    <div className="panel panel-flush">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">
            <IconPlug />
            {t.networkView.listeningPorts}
          </h2>
          <p className="panel-hint net-head-hint">{t.networkView.listeningHint}</p>
        </div>
        <RefreshButton loading={loading} onClick={load} />
      </div>

      <div className="panel-body">
        {data?.partial && (
          <div className="status-line info net-notice">
            <IconInfo />
            <span>{t.networkView.partialNotice}</span>
          </div>
        )}

        <div className="net-filters net-filters-bar">
          <input
            className="text-input"
            type="search"
            placeholder={t.networkView.filterPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="segmented" role="group">
            {(['TCP', 'UDP', 'ALL'] as const).map((option) => (
              <button
                type="button"
                key={option}
                className={protocol === option ? 'active' : ''}
                onClick={() => setProtocol(option)}
              >
                {option === 'ALL' ? t.networkView.allProtocols : option}
              </button>
            ))}
          </div>
          <label className="check-row">
            <input type="checkbox" checked={onlyExposed} onChange={(event) => setOnlyExposed(event.target.checked)} />
            {t.networkView.onlyExposed}
          </label>
          {data && <span className="text-muted text-xs">{t.networkView.portsSummary(tcpCount, udpCount, exposedTcp)}</span>}
        </div>

        <div className="table-wrap selectable">
          <table>
            <thead>
              <tr>
                <th>{t.networkView.protocol}</th>
                <th>{t.networkView.address}</th>
                <th>{t.networkView.port}</th>
                <th>{t.networkView.service}</th>
                <th>{t.networkView.process}</th>
                <th>PID</th>
                {showUser && <th>{t.networkView.user}</th>}
                <th>{t.networkView.exposure}</th>
              </tr>
            </thead>
            <tbody>
              {data?.error ? (
                <tr>
                  <td colSpan={columns} className="table-empty">
                    {t.networkView.loadError(data.error)}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns} className="table-empty">
                    {loading ? t.network.searching : t.networkView.noPorts}
                  </td>
                </tr>
              ) : (
                filtered.map((socket) => (
                  <tr key={`${socket.protocol}-${socket.address}-${socket.port}-${socket.process}`}>
                    <td>{socket.protocol}</td>
                    <td className="mono">{socket.address}</td>
                    <td className="mono">
                      <strong>{socket.port}</strong>
                    </td>
                    <td>{socket.service ?? <span className="text-muted">—</span>}</td>
                    <td>{socket.process ?? <span className="text-muted">—</span>}</td>
                    <td className="mono" title={socket.pids.join(', ')}>
                      {socket.pids.length === 0
                        ? '—'
                        : socket.pids.length === 1
                          ? socket.pids[0]
                          : `${socket.pids[0]} +${socket.pids.length - 1}`}
                    </td>
                    {showUser && <td>{socket.user ?? '—'}</td>}
                    <td>
                      <span className={`badge ${EXPOSURE_TONES[socket.exposure]}`}>
                        {t.networkView.exposures[socket.exposure]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
