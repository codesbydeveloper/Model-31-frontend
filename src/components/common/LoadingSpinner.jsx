import { cn } from '../../utils/cn'

export default function LoadingSpinner({
  size = 24,
  className = '',
  label = 'Loading',
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span
        className="animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--brand-accent)]"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
