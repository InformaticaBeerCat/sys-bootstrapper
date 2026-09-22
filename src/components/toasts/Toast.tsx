import { IconAlert, IconCheckCircle, IconInfo, IconXCircle } from '../../icons'
import type { ToastVariant } from '../../contexts/ToastContext'

const VARIANT_ICON: Record<ToastVariant, (props: { className?: string }) => JSX.Element> = {
  success: IconCheckCircle,
  info: IconInfo,
  warning: IconAlert,
  danger: IconXCircle
}

interface ToastProps {
  variant: ToastVariant
  message: string
  leaving: boolean
  onDismiss: () => void
}

export function Toast({ variant, message, leaving, onDismiss }: ToastProps) {
  const Icon = VARIANT_ICON[variant]

  return (
    <div className={`toast toast-${variant}${leaving ? ' toast-leaving' : ''}`} role="status">
      <Icon className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button type="button" className="toast-close" onClick={onDismiss} aria-label="Cerrar notificación">
        ×
      </button>
    </div>
  )
}
