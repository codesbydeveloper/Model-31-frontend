import Card from '../common/Card'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-medium">{value ?? '—'}</dd>
    </div>
  )
}

export default function BehavioralSignalsCard({ signals = [] }) {
  const current = signals.find((item) => item.period === 'Current') || signals[0]
  if (!current) return null

  return (
    <Card>
      <h2 className="text-base font-semibold">Behavioral Signals</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Current engagement signals for this lead.
      </p>
      <dl className="mt-4 space-y-2">
        <Row label="DM Opens" value={current.dmOpens} />
        <Row label="DM Replies" value={current.dmReplies} />
        <Row label="Average Reply Delay" value={current.averageReplyDelay} />
        <Row label="Story Views" value={current.storyViews} />
        <Row label="Story Replays" value={current.storyReplays} />
        <Row label="Content Saves" value={current.contentSaves} />
        <Row label="Return Visits" value={current.returnVisits} />
        <Row label="Price Questions" value={current.priceQuestions} />
        <Row label="Vehicle Interest" value={current.vehicleInterest} />
      </dl>
    </Card>
  )
}
