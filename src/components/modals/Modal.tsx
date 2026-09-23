import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../../contexts/I18nContext'

const CLOSE_ANIMATION_MS = 200

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: (requestClose: (action?: () => void) => void) => ReactNode
  size?: 'sm' | 'lg'
}

export function Modal({ title, onClose, children, footer, size = 'sm' }: ModalProps) {
  const { t } = useI18n()
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)

  const requestClose = useCallback(
    (action?: () => void) => {
      if (closingRef.current) return
      closingRef.current = true
      setClosing(true)
      setTimeout(() => (action ?? onClose)(), CLOSE_ANIMATION_MS)
    },
    [onClose]
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [requestClose])

  return (
    <div className={`modal-overlay${closing ? ' modal-overlay-closing' : ''}`} onMouseDown={() => requestClose()}>
      <div
        className={`modal-panel${size === 'lg' ? ' modal-panel-lg' : ''}${closing ? ' modal-panel-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={() => requestClose()} aria-label={t.common.close}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer(requestClose)}</div>}
      </div>
    </div>
  )
}
