import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'

export default function AcquisitionSignalsCard({ signals }) {
  if (!signals || typeof signals !== 'object') return null

  const rows = [
    { label: 'Engagement', value: signals.engagementLevel || signals.engagement },
    { label: 'Intent', value: signals.intent },
    { label: 'Budget', value: signals.budget },
    { label: 'Life Event', value: signals.lifeEvent || '—' },
    { label: 'Referral', value: signals.referralStatus || signals.referral },
    { label: 'Persona', value: signals.persona },
    { label: 'Community', value: signals.community },
    { label: 'Return Visits', value: signals.returnVisits },
    { label: 'Follow-Up', value: signals.followUp },
  ].filter((row) => row.value != null && row.value !== '')

  if (rows.length === 0) return null

  return (
    <Card className="mt-4">
      <h2 className="mb-3 text-base font-semibold">Customer Acquisition Signals</h2>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[var(--text-muted)]">{row.label}</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-primary)]">
              {row.label === 'Engagement' || row.label === 'Intent' ? (
                <StatusBadge status={String(row.value)} />
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
