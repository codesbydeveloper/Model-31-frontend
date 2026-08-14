import { cn } from '../../../utils/cn'
import { LEAD_STATUSES } from '../../../data/leads'

export default function LeadLifecycle({ currentStatus, className = '' }) {
  const currentIndex = LEAD_STATUSES.indexOf(currentStatus)

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      {LEAD_STATUSES.map((status, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        return (
          <div key={status} className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-[var(--status-ready)] text-white',
                  active && 'bg-[var(--brand-accent)] text-white',
                  !done && !active && 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
                )}
              >
                {done ? '✓' : active ? '●' : '○'}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active
                    ? 'text-[var(--text-primary)]'
                    : done
                      ? 'text-[var(--status-ready)]'
                      : 'text-[var(--text-muted)]',
                )}
              >
                {status}
              </span>
            </div>
            {index < LEAD_STATUSES.length - 1 && (
              <div className="ml-3 h-4 border-l border-[var(--border-strong)]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
