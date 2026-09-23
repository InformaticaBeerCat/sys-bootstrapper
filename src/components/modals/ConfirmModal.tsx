import { useI18n } from '../../contexts/I18nContext'
import { Modal } from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useI18n()

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            {cancelLabel ?? t.common.cancel}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => requestClose(onConfirm)}>
            {confirmLabel ?? t.common.confirm}
          </button>
        </>
      )}
    >
      <p className="modal-message">{message}</p>
    </Modal>
  )
}
