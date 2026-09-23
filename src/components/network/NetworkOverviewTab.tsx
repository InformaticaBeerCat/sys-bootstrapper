import { Fragment, type ReactNode } from 'react'
import type { NetworkOverview, PublicIpDetails } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import type { Dictionary } from '../../i18n'
import {
  IconAlert,
  IconCheckCircle,
  IconEthernet,
  IconGlobe,
  IconInfo,
  IconLaptop,
  IconRoute,
  IconServer,
  IconSignal,
  IconStethoscope,
  IconXCircle
} from '../../icons'
import { countryName, dnsServerLabel, platformName } from './format'
import { useConnectionEstimate, useOnlineStatus } from './hooks'
import { CopyableValue, IpKindBadge } from './widgets'

type FindingTone = 'ok' | 'info' | 'warn' | 'danger'

interface Finding {
  tone: FindingTone
  text: string
}

const FINDING_ICONS: Record<FindingTone, ReactNode> = {
  ok: <IconCheckCircle />,
  info: <IconInfo />,
  warn: <IconAlert />,
  danger: <IconXCircle />
}

/** Diagnóstico automático: lo que un admin miraría primero ante "no anda la red". */
function buildFindings(
  overview: NetworkOverview,
  online: boolean,
  publicIp: PublicIpDetails | null,
  t: Dictionary
): Finding[] {
  const f = t.networkView.findings
  const findings: Finding[] = []

  if (!online) findings.push({ tone: 'danger', text: f.offline })
  if (!overview.gateway.address) findings.push({ tone: 'danger', text: f.noGateway })
  for (const iface of overview.interfaces) {
    if (iface.kind === 'virtual' || iface.kind === 'vpn' || iface.kind === 'loopback') continue
    const apipa = iface.addresses.find((address) => address.family === 'IPv4' && address.kind === 'link-local')
    if (apipa) findings.push({ tone: 'warn', text: f.apipa(iface.name, apipa.address) })
  }
  if (overview.dnsServers.length === 0) findings.push({ tone: 'warn', text: f.noDns })

  if (publicIp) {
    if (!publicIp.ipv4 && !publicIp.ipv6) findings.push({ tone: 'warn', text: f.noPublicIp })
    if (publicIp.kind === 'cgnat') findings.push({ tone: 'warn', text: f.cgnat })
    if (publicIp.kind === 'private') findings.push({ tone: 'warn', text: f.publicPrivate })
  }

  // Un túnel solo cuenta como VPN activa si tiene una IP usable (los utun de macOS solo traen link-local).
  const tunnels = overview.interfaces.filter(
    (iface) =>
      iface.kind === 'vpn' && iface.addresses.some((address) => address.kind !== 'link-local' && address.kind !== 'loopback')
  )
  if (tunnels.length > 0) findings.push({ tone: 'info', text: f.vpn(tunnels.map((iface) => iface.name).join(', ')) })
  if (overview.proxy.rule && !overview.proxy.direct) findings.push({ tone: 'info', text: f.proxy(overview.proxy.rule) })
  if (overview.interfaces.some((iface) => iface.macHidden)) findings.push({ tone: 'info', text: f.macHidden })
  if (publicIp?.ipv4) findings.push(publicIp.ipv6 ? { tone: 'ok', text: f.ipv6 } : { tone: 'info', text: f.noIpv6 })

  if (!findings.some((finding) => finding.tone === 'warn' || finding.tone === 'danger')) {
    findings.unshift({ tone: 'ok', text: f.allGood })
  }
  return findings
}

interface InfoCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  hint: string
  alt?: boolean
}

function InfoCard({ icon, label, value, hint, alt }: InfoCardProps) {
  return (
    <div className={`card${alt ? ' card-alt' : ''}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-label">{label}</div>
      <div className="card-value net-card-text">{value}</div>
      <div className="card-hint">{hint}</div>
    </div>
  )
}

function InternetPanel({ publicIp, loading }: { publicIp: PublicIpDetails | null; loading: boolean }) {
  const { t, locale } = useI18n()
  const location = publicIp
    ? [publicIp.city, publicIp.region, publicIp.countryCode && countryName(publicIp.countryCode, locale)].filter(Boolean)
    : []

  return (
    <div className="panel">
      <h2 className="panel-title">
        <IconGlobe />
        {t.networkView.internet}
      </h2>
      <p className="panel-hint">{t.networkView.internetHint}</p>

      {loading ? (
        <p className="net-empty">{t.network.searching}</p>
      ) : !publicIp || (!publicIp.ipv4 && !publicIp.ipv6) ? (
        <div className="status-line warn">
          <IconAlert />
          {t.network.publicIpError(publicIp?.error ?? null)}
        </div>
      ) : (
        <>
          <dl className="net-kv selectable">
            <dt>{t.networkView.publicIpv4}</dt>
            <dd>
              {publicIp.ipv4 ? <CopyableValue value={publicIp.ipv4} /> : '—'}
              {publicIp.kind !== 'public' && <IpKindBadge kind={publicIp.kind} />}
            </dd>
            <dt>{t.networkView.publicIpv6}</dt>
            <dd>
              {publicIp.ipv6 ? <CopyableValue value={publicIp.ipv6} /> : <span className="text-muted">{t.networkView.noIpv6}</span>}
            </dd>
            <dt>{t.networkView.reverseDns}</dt>
            <dd className="mono">{publicIp.reverseDns ?? '—'}</dd>
            <dt>{t.networkView.isp}</dt>
            <dd>{publicIp.isp ?? '—'}</dd>
            <dt>{t.networkView.asn}</dt>
            <dd className="mono">{publicIp.asn ?? '—'}</dd>
            <dt>{t.networkView.location}</dt>
            <dd>{location.length > 0 ? location.join(', ') : '—'}</dd>
            <dt>{t.networkView.timezone}</dt>
            <dd>{publicIp.timezone ?? '—'}</dd>
          </dl>
          <p className="net-panel-foot">
            {publicIp.geoError
              ? t.networkView.geoError(publicIp.geoError)
              : publicIp.geoSource && t.networkView.geoSource(publicIp.geoSource)}
          </p>
        </>
      )}
    </div>
  )
}

function DnsProxyPanel({ overview }: { overview: NetworkOverview }) {
  const { t } = useI18n()
  const { proxy } = overview

  return (
    <div className="panel">
      <h2 className="panel-title">
        <IconServer />
        {t.networkView.dnsAndProxy}
      </h2>
      <p className="panel-hint">{t.networkView.dnsAndProxyHint}</p>

      <dl className="net-kv selectable">
        <dt>{t.networkView.dnsServers}</dt>
        <dd>
          {overview.dnsServers.length === 0 ? (
            '—'
          ) : (
            <div className="net-stack">
              {overview.dnsServers.map((server) => {
                const label = dnsServerLabel(server, t)
                return (
                  <div className="net-inline" key={server}>
                    <CopyableValue value={server} />
                    {label && <span className="badge badge-neutral">{label}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </dd>
        <dt>{t.networkView.proxy}</dt>
        <dd>
          {proxy.error ? (
            <span className="text-muted">{proxy.error}</span>
          ) : proxy.direct ? (
            <span className="badge badge-success">{t.networkView.proxyDirect}</span>
          ) : (
            <span className="mono">{proxy.rule}</span>
          )}
        </dd>
        {Object.entries(proxy.env).map(([name, value]) => (
          <Fragment key={name}>
            <dt className="mono">{name}</dt>
            <dd className="mono">{value}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  )
}

interface NetworkOverviewTabProps {
  overview: NetworkOverview
  publicIp: PublicIpDetails | null
  publicLoading: boolean
}

export function NetworkOverviewTab({ overview, publicIp, publicLoading }: NetworkOverviewTabProps) {
  const { t } = useI18n()
  const online = useOnlineStatus()
  const estimate = useConnectionEstimate()
  const primary = overview.interfaces.find((iface) => iface.isPrimary) ?? null
  const primaryIpv4 = primary?.addresses.find((address) => address.family === 'IPv4') ?? null
  const findings = buildFindings(overview, online, publicLoading ? null : publicIp, t)

  return (
    <>
      <div className="cards">
        <InfoCard
          icon={<IconLaptop />}
          label={t.networkView.machine}
          value={overview.hostname}
          hint={platformName(overview.platform)}
        />
        <InfoCard
          icon={<IconSignal />}
          label={t.networkView.connection}
          value={
            <span className="net-inline">
              <span className={`net-dot ${online ? 'on' : 'off'}`} />
              {online ? t.networkView.online : t.networkView.offline}
            </span>
          }
          hint={estimate ? t.networkView.connectionEstimate(estimate.effectiveType, estimate.downlink, estimate.rtt) : ''}
          alt={!online}
        />
        <InfoCard
          icon={<IconRoute />}
          label={t.networkView.gateway}
          value={overview.gateway.address ?? t.networkView.noGateway}
          hint={overview.gateway.interfaceName ? t.networkView.viaInterface(overview.gateway.interfaceName) : ''}
          alt={!overview.gateway.address}
        />
        <InfoCard
          icon={<IconEthernet />}
          label={t.networkView.primaryInterface}
          value={primaryIpv4 ? `${primaryIpv4.address}/${primaryIpv4.prefixLength ?? '?'}` : '—'}
          hint={primary ? [primary.name, primary.label].filter(Boolean).join(' · ') : t.network.noInterfaces}
        />
      </div>

      <div className="panel">
        <h2 className="panel-title">
          <IconStethoscope />
          {t.networkView.findingsTitle}
        </h2>
        <p className="panel-hint">{t.networkView.findingsHint}</p>
        <div className="net-findings">
          {findings.map((finding) => (
            <div className={`status-line ${finding.tone}`} key={finding.text}>
              {FINDING_ICONS[finding.tone]}
              <span>{finding.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="net-grid-2">
        <InternetPanel publicIp={publicIp} loading={publicLoading} />
        <DnsProxyPanel overview={overview} />
      </div>
    </>
  )
}
