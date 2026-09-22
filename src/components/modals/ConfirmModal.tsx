import { Modal } from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={(requestClose) => (
        <>
          <button type="button" className="btn" onClick={() => requestClose(onCancel)}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => requestClose(onConfirm)}>
            {confirmLabel}
          </button>
        </>
      )}
    >
      <p className="modal-message">{message}</p>
    </Modal>
  )
}
