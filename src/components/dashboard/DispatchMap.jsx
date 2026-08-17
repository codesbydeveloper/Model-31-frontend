import Card from '../common/Card'

const STATUS_COLOR = {
  ONLINE: 'var(--status-ready)',
  BUSY: 'var(--status-pending)',
  OFFLINE: 'var(--text-muted)',
}

export default function DispatchMap({ map }) {
  if (!map) return null
  const rooftops = map.rooftops || []
  const salespeople = map.salespeople || []
  const leads = map.activeLeads || []

  const point = (id) => {
    const rooftop = rooftops.find((item) => item.id === id)
    const person = salespeople.find((item) => item.id === id)
    const lead = leads.find((item) => item.id === id)
    return rooftop || person || lead
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">AI Dispatch Map</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Lead → Rooftop → Available Salesperson
      </p>

      <div className="relative mt-4 min-h-[280px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(#c8d0da 1px, transparent 1px), linear-gradient(90deg, #c8d0da 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {leads.map((lead) => {
            const rooftop = point(lead.rooftopId)
            const person = point(lead.salespersonId)
            if (!rooftop) return null
            return (
              <g key={lead.id}>
                <line
                  x1={`${lead.x}%`}
                  y1={`${lead.y}%`}
                  x2={`${rooftop.x}%`}
                  y2={`${rooftop.y}%`}
                  stroke="#1a6b8a"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {person && (
                  <line
                    x1={`${rooftop.x}%`}
                    y1={`${rooftop.y}%`}
                    x2={`${person.x}%`}
                    y2={`${person.y}%`}
                    stroke="#0f2b46"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {rooftops.map((item) => (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-primary)] px-2 py-1 text-[10px] font-semibold text-white shadow-sm"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            title={item.name}
          >
            {item.city}
          </div>
        ))}

        {salespeople.map((item) => (
          <div
            key={item.id}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              background: STATUS_COLOR[item.status],
            }}
            title={`${item.name} · ${item.status}`}
          />
        ))}

        {leads.map((item) => (
          <div
            key={item.id}
            className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[var(--brand-accent)] ring-2 ring-white"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            title={`${item.name} · Active Lead`}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-ready)]" /> Online
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-pending)]" /> Busy
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" /> Offline
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand-accent)]" /> Active Lead
        </li>
      </ul>
    </Card>
  )
}
