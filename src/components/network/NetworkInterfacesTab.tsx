import { Fragment, useState, type ComponentType } from 'react'
import type { InterfaceKind, NetworkInterfaceInfo } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import {
  IconEthernet,
  IconLaptop,
  IconLock,
  IconNetwork,
  IconServer,
  IconWifi,
  type IconProps
} from '../../icons'
import { formatBytes, formatNumber } from './format'
import { CopyableValue, IpKindBadge } from './widgets'

const KIND_ICONS: Record<InterfaceKind, ComponentType<IconProps>> = {
  ethernet: IconEthernet,
  wifi: IconWifi,
  vpn: IconLock,
  virtual: IconServer,
  loopback: IconLaptop,
  other: IconNetwork
}

/** Loopback, virtuales y túneles que solo tienen link-local (en macOS hay varios utun siempre presentes). */
function isNoise(iface: NetworkInterfaceInfo): boolean {
  if (iface.kind === 'loopback' || iface.kind === 'virtual') return true
  return iface.kind === 'vpn' && iface.addresses.every((address) => address.kind === 'link-local')
}

function InterfaceCard({ iface }: { iface: NetworkInterfaceInfo }) {
  const { t, locale } = useI18n()
  const KindIcon = KIND_ICONS[iface.kind]
  const ipv4 = iface.addresses.filter((address) => address.family === 'IPv4')
  const ipv6 = iface.addresses.filter((address) => address.family === 'IPv6')

  return (
    <div className="panel">
      <div className="net-iface-head">
        <span className={`net-iface-icon${iface.isPrimary ? ' primary' : ''}`}>
          <KindIcon />
        </span>
        <div className="net-iface-title">
          <span className="net-iface-name">{iface.name}</span>
          {iface.label && <span className="net-iface-label">{iface.label}</span>}
        </div>
        <div className="comp-row">
          {iface.isPrimary && <span className="badge badge-success">{t.networkView.primary}</span>}
          <span className="badge badge-neutral">{t.networkView.kinds[iface.kind]}</span>
        </div>
      </div>

      <dl className="net-kv selectable">
        <dt>MAC</dt>
        <dd>
          {iface.mac ? (
            <>
              <CopyableValue value={iface.mac} />
              {iface.macKind === 'local' && <span className="badge badge-info">{t.networkView.privateMac}</span>}
            </>
          ) : iface.macHidden ? (
            <span className="text-muted">{t.networkView.macHidden}</span>
          ) : (
            '—'
          )}
        </dd>

        {iface.hardwareMac && iface.hardwareMac !== iface.mac && (
          <>
            <dt>{t.networkView.hardwareMac}</dt>
            <dd>
              <CopyableValue value={iface.hardwareMac} />
            </dd>
          </>
        )}

        <dt>MTU</dt>
        <dd className="mono">{iface.mtu ?? '—'}</dd>

        {iface.rxBytes !== null && iface.txBytes !== null && (
          <>
            <dt>{t.networkView.traffic}</dt>
            <dd>
              ↓ {formatBytes(iface.rxBytes, locale)} · ↑ {formatBytes(iface.txBytes, locale)}
            </dd>
          </>
        )}

        {ipv4.map((address) => (
          <Fragment key={address.address}>
            <dt>IPv4</dt>
            <dd>
              <div className="net-addr">
                <div className="net-inline">
                  <CopyableValue value={`${address.address}/${address.prefixLength ?? '?'}`} />
                  <IpKindBadge kind={address.kind} />
                </div>
                {address.subnet && (
                  <span className="net-addr-sub">
                    {t.networkView.subnetSummary(
                      address.subnet.network,
                      address.subnet.broadcast,
                      formatNumber(address.subnet.hostCount, locale)
                    )}
                  </span>
                )}
              </div>
            </dd>
          </Fragment>
        ))}

        {ipv6.length > 0 && (
          <>
            <dt>IPv6</dt>
            <dd>
              <div className="net-stack">
                {ipv6.map((address) => (
                  <div className="net-inline" key={address.address}>
                    <CopyableValue value={`${address.address}/${address.prefixLength ?? '?'}`} />
                    <IpKindBadge kind={address.kind} />
                  </div>
                ))}
              </div>
            </dd>
          </>
        )}
      </dl>
    </div>
  )
}

export function NetworkInterfacesTab({ interfaces }: { interfaces: NetworkInterfaceInfo[] }) {
  const { t } = useI18n()
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? interfaces : interfaces.filter((iface) => !isNoise(iface))

  return (
    <>
      <div className="net-filters net-filters-bar">
        <label className="check-row">
          <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />
          {t.networkView.showAllInterfaces}
        </label>
        <span className="badge badge-neutral">{t.networkView.interfacesShown(visible.length, interfaces.length)}</span>
      </div>

      <div className="net-iface-grid">
        {visible.map((iface) => (
          <InterfaceCard iface={iface} key={iface.name} />
        ))}
      </div>
    </>
  )
}
