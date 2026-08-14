import { cn } from '../../utils/cn'

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className = '',
}) {
  return (
    <div className={cn('card p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
