import { useEffect } from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const icons = {
  success: CheckCircle2,
  info: Info,
  error: AlertTriangle,
}

const styles = {
  success: 'border-[var(--status-ready)] bg-[var(--status-ready-bg)] text-[var(--status-ready)]',
  info: 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]',
  error: 'border-[var(--status-error)] bg-[var(--status-error-bg)] text-[var(--status-error)]',
}

export default function Toast({
  open,
  message,
  type = 'info',
  onClose,
  duration = 3000,
  className = '',
}) {
  useEffect(() => {
    if (!open || !duration) return undefined
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [open, duration, onClose])

  if (!open || !message) return null

  const Icon = icons[type] || Info

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 shadow-[var(--shadow-md)]',
        styles[type],
        className,
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm text-[var(--text-primary)]">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <X size={16} />
      </button>
    </div>
  )
}
