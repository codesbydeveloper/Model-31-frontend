export default function CrmReadOnlyBanner({ className = '', banner }) {
  const crmMode = banner?.crmMode || 'READ ONLY'
  const pipeline = banner?.pipeline || 'DEALERSHIP'
  const source = banner?.source || 'CRM'
  const access = banner?.model31Access || 'READ ONLY'
  const note = banner?.note || 'Model 31 does not modify dealership leads.'

  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 ${className}`}
    >
      <p className="text-sm font-semibold">CRM Mode: {crmMode}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Pipeline: {pipeline} · Source: {source} · Model 31 Access: {access}
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]" title={note}>
        {note}
      </p>
    </div>
  )
}
