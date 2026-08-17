import { cn } from '../../utils/cn'
import { PIPELINE_TYPES, pipelineLabel } from '../../utils/pipeline'

export default function PipelineBadge({ pipelineType, className = '' }) {
  const isModel31 = pipelineType === PIPELINE_TYPES.MODEL31
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        isModel31
          ? 'bg-[var(--brand-primary)] text-white'
          : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] ring-1 ring-[var(--border-default)]',
        className,
      )}
    >
      {pipelineLabel(pipelineType)}
    </span>
  )
}
