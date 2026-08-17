import { Link } from 'react-router-dom'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'

export default function BdcSmartInbox({ rows = [] }) {
  return (
    <Card>
      <h2 className="text-base font-semibold">BDC Smart Inbox</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Recent conversations waiting for attention.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((item) => (
          <li key={item.id}>
            <Link
              to={`/super-admin/leads/${item.id}`}
              className="block rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-3 hover:bg-[var(--bg-muted)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{item.customerName}</p>
                  <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
                    {item.latestMessage}
                  </p>
                </div>
                <StatusBadge status={item.priority} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                <StatusBadge status={`Tier ${item.tier}`} />
                <span>Score {item.score}</span>
                <span>{item.salesperson}</span>
                <span>{item.time}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
