import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { PrivateIpInfo, PublicIpInfo } from '../../../electron/shared/network'
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
  const [copied, copy] = useCopyToClipboard()

  return (
    <div className="card net-card">
      <div className="net-card-top">
        <div className="card-icon">{icon}</div>
        <button type="button" className="net-card-refresh" onClick={onRefresh} disabled={loading} title="Actualizar">
          <IconRefresh className={loading ? 'net-spin' : ''} />
        </button>
      </div>

      <div className="card-label">{title}</div>

      <div className="net-card-value-row">
        <span className="net-card-value">{loading ? 'Buscando…' : address ?? 'No disponible'}</span>
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

  const privateBadge = privateInfo?.kind === 'cgnat' ? { label: 'Rango CG-NAT', tone: 'warning' as const } : null

  const publicBadge =
    publicInfo?.kind === 'cgnat'
      ? { label: 'Posible CG-NAT', tone: 'warning' as const }
      : publicInfo?.kind === 'private'
        ? { label: 'Rango privado (inusual)', tone: 'warning' as const }
        : null

  return (
    <div className="cards net-cards">
      <IpCard
        icon={<IconNetwork />}
        title="IP privada (LAN)"
        address={privateInfo?.address ?? null}
        hint={privateInfo?.interfaceName ? `Interfaz: ${privateInfo.interfaceName}` : 'Sin interfaces de red activas'}
        badge={privateBadge}
        loading={privateLoading}
        onRefresh={loadPrivateIp}
      />
      <IpCard
        icon={<IconGlobe />}
        title="IP pública"
        address={publicInfo?.address ?? null}
        hint="Si cambia seguido o no coincide con la de tu router, puede que estés detrás de un CG-NAT o VPN."
        errorMessage={publicInfo?.error ?? null}
        badge={publicBadge}
        loading={publicLoading}
        onRefresh={loadPublicIp}
      />
    </div>
  )
}
