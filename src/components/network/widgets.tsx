import type { IpRangeKind } from '../../../electron/shared/network'
import { useI18n } from '../../contexts/I18nContext'
import { IconCheck, IconCopy, IconRefresh } from '../../icons'
import { useCopyToClipboard } from './hooks'

export function CopyButton({ text }: { text: string }) {
  const { t } = useI18n()
  const [copied, copy] = useCopyToClipboard()
  return (
    <button
      type="button"
      className="net-copy"
      onClick={() => copy(text)}
      title={copied ? t.common.copied : t.common.copy}
      aria-label={t.common.copy}
    >
      {copied ? <IconCheck /> : <IconCopy />}
    </button>
  )
}

export function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const { t } = useI18n()
  return (
    <button type="button" className="btn btn-sm" onClick={onClick} disabled={loading}>
      <IconRefresh className={loading ? 'net-spin' : ''} />
      {t.common.refresh}
    </button>
  )
}

const IP_KIND_TONES: Record<IpRangeKind, string> = {
  public: 'badge-info',
  private: 'badge-neutral',
  cgnat: 'badge-warning',
  loopback: 'badge-neutral',
  'link-local': 'badge-neutral',
  unknown: 'badge-neutral'
}

export function IpKindBadge({ kind }: { kind: IpRangeKind }) {
  const { t } = useI18n()
  if (kind === 'unknown') return null
  return <span className={`badge ${IP_KIND_TONES[kind]}`}>{t.networkView.ipKinds[kind]}</span>
}

/** Valor monoespaciado seleccionable con botón de copiar al lado. */
export function CopyableValue({ value }: { value: string }) {
  return (
    <>
      <span className="mono">{value}</span>
      <CopyButton text={value} />
    </>
  )
}
