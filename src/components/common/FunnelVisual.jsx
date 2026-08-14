import { cn } from '../../utils/cn'

export default function FunnelVisual({ stages = [], className = '' }) {
  const max = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className={cn('space-y-3', className)}>
      {stages.map((stage, index) => {
        const width = Math.max(28, Math.round((stage.count / max) * 100))
        return (
          <div key={stage.stage} className="flex flex-col items-center">
            <div
              className="flex w-full max-w-md items-center justify-between rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-2.5 text-white transition-all"
              style={{ width: `${width}%` }}
            >
              <span className="text-xs font-semibold tracking-wide">
                {stage.stage}
              </span>
              <span className="text-sm font-semibold">
                {Number(stage.count).toLocaleString()}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className="my-1 text-[var(--text-muted)]">↓</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
