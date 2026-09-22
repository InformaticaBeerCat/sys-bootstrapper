import { Toast } from './Toast'
import type { ToastVariant } from '../../contexts/ToastContext'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  leaving: boolean
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          message={toast.message}
          leaving={toast.leaving}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}
