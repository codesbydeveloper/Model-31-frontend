import Card from '../common/Card'

export default function GenomeTimeline({ events = [] }) {
  if (!events.length) return null
  return (
    <Card>
      <h2 className="text-base font-semibold">Buyer Genome Timeline</h2>
      <ol className="mt-4 space-y-2">
        {events.map((item, index) => (
          <li key={item.id}>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.timestamp}</p>
            </div>
            {index < events.length - 1 && (
              <p className="py-1 text-center text-xs text-[var(--text-muted)]">↓</p>
            )}
          </li>
        ))}
      </ol>
    </Card>
  )
}
