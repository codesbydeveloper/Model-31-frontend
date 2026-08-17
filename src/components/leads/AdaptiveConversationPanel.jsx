import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'

export default function AdaptiveConversationPanel({
  genome,
  onUse,
  onEdit,
  onDismiss,
  dismissed,
}) {
  if (!genome || dismissed) return null
  return (
    <Card className="!p-4">
      <h3 className="text-sm font-semibold">AI Response Strategy</h3>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[var(--text-muted)]">Tone</dt>
          <dd className="font-medium">{genome.tone}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Message Length</dt>
          <dd className="font-medium">{genome.length}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Urgency</dt>
          <dd>
            <StatusBadge status={genome.urgencyLabel} />
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Hesitation</dt>
          <dd>
            <StatusBadge status={genome.hesitationLabel} />
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">Reason: </span>
        {genome.reason}
      </p>
      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Suggested Response
        </p>
        <p className="mt-1 text-sm">{genome.suggestedResponse}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onUse?.(genome.suggestedResponse)}>
          Use Suggestion
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onEdit?.(genome.suggestedResponse)}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </Card>
  )
}
