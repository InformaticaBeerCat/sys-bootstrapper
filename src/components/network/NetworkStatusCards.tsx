import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { PrivateIpInfo, PublicIpInfo } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconCheck, IconCopy, IconGlobe, IconNetwork, IconRefresh, IconShield } from '../../icons'

type BadgeTone = 'warning' | 'neutral'

interface IpCardProps {
  icon: ReactNode
  title: string
  address: string | null
  hint?: string
  errorMessage?: string | null
  badge?: { label: string; tone: BadgeTone } | null
  loading: boolean
  onRefresh: () => void
}

function useCopyToClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {
        // portapapeles no disponible (permisos/plataforma) - el botón simplemente no hace nada
      })
  }, [])
  return [copied, copy]
}

function IpCard({ icon, title, address, hint, errorMessage, badge, loading, onRefresh }: IpCardProps) {
  const { t } = useI18n()
  const [copied, copy] = useCopyToClipboard()

  return (
    <div className="card net-card">
      <div className="net-card-top">
        <div className="card-icon">{icon}</div>
        <button type="button" className="net-card-refresh" onClick={onRefresh} disabled={loading} title={t.common.refresh}>
          <IconRefresh className={loading ? 'net-spin' : ''} />
        </button>
      </div>

      <div className="card-label">{title}</div>

      <div className="net-card-value-row">
        <span className="net-card-value">{loading ? t.network.searching : address ?? t.network.unavailable}</span>
        {address && !loading && (
          <button type="button" className="btn btn-sm" onClick={() => copy(address)}>
            {copied ? <IconCheck /> : <IconCopy />}
          </button>
        )}
      </div>

      <div className="net-card-footer">
        {badge && (
          <span className={`badge badge-${badge.tone}`}>
            {badge.tone === 'warning' && <IconShield />}
            {badge.label}
          </span>
        )}
        <span className="card-hint">{loading ? '' : errorMessage ?? hint}</span>
      </div>
    </div>
  )
}

export function NetworkStatusCards() {
  const { t } = useI18n()
  const [privateInfo, setPrivateInfo] = useState<PrivateIpInfo | null>(null)
  const [privateLoading, setPrivateLoading] = useState(true)
  const [publicInfo, setPublicInfo] = useState<PublicIpInfo | null>(null)
  const [publicLoading, setPublicLoading] = useState(true)

  const loadPrivateIp = useCallback(async () => {
    setPrivateLoading(true)
    const data = await window.sysBootstrapper.network.getPrivateIp()
    setPrivateInfo(data)
    setPrivateLoading(false)
  }, [])

  const loadPublicIp = useCallback(async () => {
    setPublicLoading(true)
    const data = await window.sysBootstrapper.network.getPublicIp()
    setPublicInfo(data)
    setPublicLoading(false)
  }, [])

  useEffect(() => {
    loadPrivateIp()
    loadPublicIp()
  }, [loadPrivateIp, loadPublicIp])

  const privateBadge = privateInfo?.kind === 'cgnat' ? { label: t.network.cgnatRange, tone: 'warning' as const } : null

  const publicBadge =
    publicInfo?.kind === 'cgnat'
      ? { label: t.network.possibleCgnat, tone: 'warning' as const }
      : publicInfo?.kind === 'private'
        ? { label: t.network.unusualPrivateRange, tone: 'warning' as const }
        : null

  return (
    <div className="cards net-cards">
      <IpCard
        icon={<IconNetwork />}
        title={t.network.privateIp}
        address={privateInfo?.address ?? null}
        hint={privateInfo?.interfaceName ? t.network.interfaceName(privateInfo.interfaceName) : t.network.noInterfaces}
        badge={privateBadge}
        loading={privateLoading}
        onRefresh={loadPrivateIp}
      />
      <IpCard
        icon={<IconGlobe />}
        title={t.network.publicIp}
        address={publicInfo?.address ?? null}
        hint={t.network.publicIpHint}
        errorMessage={publicInfo && !publicInfo.address ? t.network.publicIpError(publicInfo.error) : null}
        badge={publicBadge}
        loading={publicLoading}
        onRefresh={loadPublicIp}
      />
    </div>
  )
}
