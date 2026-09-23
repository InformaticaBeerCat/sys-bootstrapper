import { useCallback, useEffect, useState, type ComponentType } from 'react'
import type { NetworkOverview, PublicIpDetails } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { useToast } from '../../contexts/ToastContext'
import {
  IconCopy,
  IconDashboard,
  IconEthernet,
  IconFileExport,
  IconNetwork,
  IconPlug,
  IconRefresh,
  IconRoute,
  IconStethoscope,
  type IconProps
} from '../../icons'
import { DnsLookupPanel } from './DnsLookupPanel'
import { formatTime } from './format'
import { NetworkInterfacesTab } from './NetworkInterfacesTab'
import { NetworkOverviewTab } from './NetworkOverviewTab'
import { NetworkPortsTab } from './NetworkPortsTab'
import { NetworkRoutesTab } from './NetworkRoutesTab'
import { PortCheckPanel } from './PortCheckPanel'
import { TlsInspectPanel } from './TlsInspectPanel'
import { RefreshButton } from './widgets'

type TabId = 'overview' | 'interfaces' | 'routes' | 'ports' | 'diagnostics'

const TABS: Array<{ id: TabId; Icon: ComponentType<IconProps> }> = [
  { id: 'overview', Icon: IconDashboard },
  { id: 'interfaces', Icon: IconEthernet },
  { id: 'routes', Icon: IconRoute },
  { id: 'ports', Icon: IconPlug },
  { id: 'diagnostics', Icon: IconStethoscope }
]

interface NetworkViewProps {
  initialOverview: NetworkOverview | null
}

export function NetworkView({ initialOverview }: NetworkViewProps) {
  const { t, locale } = useI18n()
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabId>('overview')
  // Las pestañas se montan la primera vez que se abren y después solo se ocultan, para no perder
  // lo cargado (puertos, rutas) ni lo escrito en los formularios de diagnóstico al cambiar de pestaña.
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set(['overview']))
  const [overview, setOverview] = useState<NetworkOverview | null>(initialOverview)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [publicIp, setPublicIp] = useState<PublicIpDetails | null>(null)
  const [publicLoading, setPublicLoading] = useState(true)
  const [exporting, setExporting] = useState<'copy' | 'save' | null>(null)

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      setOverview(await window.sysBootstrapper.network.getOverview())
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const loadPublicIp = useCallback(async () => {
    setPublicLoading(true)
    try {
      setPublicIp(await window.sysBootstrapper.network.getPublicIpDetails())
    } finally {
      setPublicLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialOverview) loadOverview()
    loadPublicIp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectTab(next: TabId) {
    setTab(next)
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)))
  }

  function refreshOverview() {
    loadOverview()
    loadPublicIp()
  }

  async function handleCopyReport() {
    setExporting('copy')
    try {
      const report = await window.sysBootstrapper.network.getReport()
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      showToast(t.networkView.reportCopied, 'success')
    } catch {
      showToast(t.networkView.reportError, 'danger')
    } finally {
      setExporting(null)
    }
  }

  async function handleSaveReport() {
    setExporting('save')
    try {
      const result = await window.sysBootstrapper.network.saveReport()
      if (result.success && result.filePath) showToast(t.networkView.reportSaved(result.filePath), 'success')
      else showToast(t.networkView.reportError, 'danger')
    } catch {
      showToast(t.networkView.reportError, 'danger')
    } finally {
      setExporting(null)
    }
  }

  const showOverviewToolbar = tab === 'overview' || tab === 'interfaces'

  return (
    <div className="view view-wide">
      <div className="tool-header net-header">
        <span className="tool-logo net-logo">
          <IconNetwork />
        </span>
        <div className="net-header-text">
          <h1 className="view-title">{t.nav.network}</h1>
          <p className="view-description">{t.networkView.description}</p>
        </div>
        <div className="comp-row net-header-actions">
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleCopyReport}
            disabled={exporting !== null}
            title={t.networkView.reportHint}
          >
            {exporting === 'copy' ? <IconRefresh className="net-spin" /> : <IconCopy />}
            {t.networkView.copyReport}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveReport}
            disabled={exporting !== null}
            title={t.networkView.reportHint}
          >
            {exporting === 'save' ? <IconRefresh className="net-spin" /> : <IconFileExport />}
            {t.networkView.exportReport}
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(({ id, Icon }) => (
          <button
            type="button"
            role="tab"
            key={id}
            aria-selected={tab === id}
            className={`tab${tab === id ? ' active' : ''}`}
            onClick={() => selectTab(id)}
          >
            <Icon />
            {t.networkView.tabs[id]}
          </button>
        ))}
      </div>

      {showOverviewToolbar && overview && (
        <div className="net-toolbar">
          <span>{t.networkView.collectedAt(formatTime(overview.collectedAt, locale))}</span>
          <RefreshButton loading={overviewLoading || publicLoading} onClick={refreshOverview} />
        </div>
      )}

      {!overview ? (
        <p className="net-empty">{t.networkView.loading}</p>
      ) : (
        <>
          <div hidden={tab !== 'overview'}>
            <NetworkOverviewTab overview={overview} publicIp={publicIp} publicLoading={publicLoading} />
          </div>
          {visited.has('interfaces') && (
            <div hidden={tab !== 'interfaces'}>
              <NetworkInterfacesTab interfaces={overview.interfaces} />
            </div>
          )}
          {visited.has('routes') && (
            <div hidden={tab !== 'routes'}>
              <NetworkRoutesTab gatewayAddress={overview.gateway.address} />
            </div>
          )}
        </>
      )}
      {visited.has('ports') && (
        <div hidden={tab !== 'ports'}>
          <NetworkPortsTab />
        </div>
      )}
      {visited.has('diagnostics') && (
        <div hidden={tab !== 'diagnostics'}>
          <DnsLookupPanel />
          <PortCheckPanel />
          <TlsInspectPanel />
        </div>
      )}
    </div>
  )
}
