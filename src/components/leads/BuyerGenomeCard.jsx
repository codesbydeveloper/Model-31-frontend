import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { bandFromScore } from '../../data/buyerGenome'

function ScoreRow({ label, score, extra }) {
  const value = Number(score || 0).toFixed(2)
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="font-medium tabular-nums">{extra || value}</span>
        {typeof score === 'number' && <StatusBadge status={bandFromScore(score)} />}
      </dd>
    </div>
  )
}

export default function BuyerGenomeCard({ genome }) {
  if (!genome) {
    return (
      <Card>
        <h2 className="text-base font-semibold">Buyer Genome</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          No buyer genome is available for this record.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Buyer Genome</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Intent {genome.intent}
      </p>
      <dl className="mt-4 space-y-2">
        <ScoreRow label="Urgency" score={genome.urgency} />
        <ScoreRow label="Budget Sensitivity" score={genome.budgetSensitivity} />
        <ScoreRow label="Hesitation" score={genome.hesitation} />
        <ScoreRow label="Risk Tolerance" score={genome.riskTolerance} />
        <ScoreRow label="Preferred Tone" extra={genome.tone} />
        <ScoreRow label="Preferred Message Length" extra={genome.length} />
        <ScoreRow label="Best Reply Timing" extra={genome.timing} />
      </dl>
    </Card>
  )
}
