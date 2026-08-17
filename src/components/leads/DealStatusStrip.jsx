import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'

export default function DealStatusStrip({
  nuclearOn,
  negotiationStatus,
  handoff,
}) {
  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold">Deal Assistance Status</h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Nuclear Mode</dt>
          <dd className="mt-1">
            <StatusBadge status={nuclearOn ? 'ON' : 'OFF'} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Negotiation status</dt>
          <dd className="mt-1">
            <StatusBadge status={negotiationStatus || 'UNAVAILABLE'} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Manager Handoff</dt>
          <dd className="mt-1">
            <StatusBadge status={handoff?.dealStatus || 'NONE'} />
          </dd>
        </div>
      </dl>
    </Card>
  )
}
