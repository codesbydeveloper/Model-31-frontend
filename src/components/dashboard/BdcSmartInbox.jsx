import { Link } from 'react-router-dom'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'

export default function BdcSmartInbox({ rows = [] }) {
  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-base font-semibold">BDC Smart Inbox</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Recent conversations waiting for attention.
      </p>
      <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <li className="text-sm text-[var(--text-secondary)]">No inbox items.</li>
        ) : (
          rows.map((item) => {
            const href = String(item.id || '').startsWith('LEAD-')
              ? `/super-admin/leads/${item.id}`
              : null
            const body = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{item.customerName}</p>
                    <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
                      {item.latestMessage}
                    </p>
                  </div>
                  {item.priority ? <StatusBadge status={item.priority} /> : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {item.tier ? <StatusBadge status={item.tier} /> : null}
                  <span>Score {item.score}</span>
                  <span>{item.salesperson}</span>
                  <span>{item.time}</span>
                </div>
              </>
            )
            return (
              <li key={item.id}>
                {href ? (
                  <Link
                    to={href}
                    className="block rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-3 hover:bg-[var(--bg-muted)]"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-3">
                    {body}
                  </div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </Card>
  )
}
