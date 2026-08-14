import Button from './Button'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = false,
}) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title}>
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={danger ? '!bg-[var(--status-error)] hover:!bg-[#912018]' : ''}
        >
          {loading ? (
            <>
              <LoadingSpinner size={16} />
              Working…
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </div>
    </Modal>
  )
}
