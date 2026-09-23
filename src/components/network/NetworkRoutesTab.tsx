import { useCallback, useEffect, useState } from 'react'
import type { NeighborsResult, RoutesResult } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconAlert, IconRoute, IconSitemap } from '../../icons'
import { CopyableValue, RefreshButton } from './widgets'

export function NetworkRoutesTab({ gatewayAddress }: { gatewayAddress: string | null }) {
  const { t } = useI18n()
  const [routes, setRoutes] = useState<RoutesResult | null>(null)
  const [neighbors, setNeighbors] = useState<NeighborsResult | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [nextRoutes, nextNeighbors] = await Promise.all([
        window.sysBootstrapper.network.getRoutes(),
        window.sysBootstrapper.network.getNeighbors()
      ])
      setRoutes(nextRoutes)
      setNeighbors(nextNeighbors)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const routeList = routes?.routes ?? []
  const neighborList = neighbors?.neighbors ?? []
  // macOS no informa métrica y Windows no tiene flags: la columna se muestra solo si hay datos.
  const showMetric = routeList.some((route) => route.metric !== null)
  const showFlags = routeList.some((route) => route.flags)
  const routeColumns = 3 + Number(showMetric) + Number(showFlags)

  return (
    <>
      <div className="panel panel-flush">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">
              <IconRoute />
              {t.networkView.routingTable}
            </h2>
            <p className="panel-hint net-head-hint">{t.networkView.routingHint}</p>
          </div>
          <div className="comp-row">
            {routes && <span className="badge badge-neutral">{routeList.length}</span>}
            <RefreshButton loading={loading} onClick={load} />
          </div>
        </div>
        <div className="panel-body">
          <div className="table-wrap selectable">
            <table>
              <thead>
                <tr>
                  <th>{t.networkView.destination}</th>
                  <th>{t.networkView.gatewayColumn}</th>
                  <th>{t.networkView.interface}</th>
                  {showMetric && <th>{t.networkView.metric}</th>}
                  {showFlags && <th>{t.networkView.flags}</th>}
                </tr>
              </thead>
              <tbody>
                {routes?.error ? (
                  <tr>
                    <td colSpan={routeColumns} className="table-empty">
                      {t.networkView.loadError(routes.error)}
                    </td>
                  </tr>
                ) : routeList.length === 0 ? (
                  <tr>
                    <td colSpan={routeColumns} className="table-empty">
                      {loading ? t.network.searching : t.networkView.noRoutes}
                    </td>
                  </tr>
                ) : (
                  routeList.map((route, index) => (
                    <tr key={`${route.destination}-${route.interfaceName}-${index}`} className={route.isDefault ? 'net-row-highlight' : ''}>
                      <td>
                        {route.isDefault ? (
                          <span className="badge badge-success">{t.networkView.defaultRoute}</span>
                        ) : (
                          <span className="mono">{route.destination}</span>
                        )}
                      </td>
                      <td>
                        {route.gateway ? (
                          <span className="mono">{route.gateway}</span>
                        ) : (
                          <span className="text-muted">{t.networkView.onLink}</span>
                        )}
                      </td>
                      <td className="mono">{route.interfaceName ?? '—'}</td>
                      {showMetric && <td className="mono">{route.metric ?? '—'}</td>}
                      {showFlags && <td className="mono">{route.flags ?? '—'}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">
              <IconSitemap />
              {t.networkView.neighbors}
            </h2>
            <p className="panel-hint net-head-hint">{t.networkView.neighborsHint}</p>
          </div>
          {neighbors && <span className="badge badge-neutral">{neighborList.length}</span>}
        </div>
        <div className="panel-body">
          {neighbors?.restricted && (
            <div className="status-line warn net-notice">
              <IconAlert />
              <span>{t.networkView.arpRestricted}</span>
            </div>
          )}
          <div className="table-wrap selectable">
            <table>
              <thead>
                <tr>
                  <th>{t.networkView.ipAddress}</th>
                  <th>MAC</th>
                  <th>{t.networkView.interface}</th>
                  <th>{t.networkView.type}</th>
                </tr>
              </thead>
              <tbody>
                {neighbors?.error ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {t.networkView.loadError(neighbors.error)}
                    </td>
                  </tr>
                ) : neighborList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {loading ? t.network.searching : t.networkView.noNeighbors}
                    </td>
                  </tr>
                ) : (
                  neighborList.map((neighbor) => (
                    <tr key={`${neighbor.address}-${neighbor.interfaceName}`}>
                      <td>
                        <span className="net-inline">
                          <CopyableValue value={neighbor.address} />
                          {neighbor.address === gatewayAddress && (
                            <span className="badge badge-success">{t.networkView.router}</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="net-inline">
                          <CopyableValue value={neighbor.mac} />
                          {neighbor.macKind === 'local' && (
                            <span className="badge badge-info">{t.networkView.privateMac}</span>
                          )}
                        </span>
                      </td>
                      <td className="mono">{neighbor.interfaceName ?? '—'}</td>
                      <td>{t.networkView.neighborStates[neighbor.state]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
