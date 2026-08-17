export default function CrmReadOnlyBanner({ className = '' }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 ${className}`}
    >
      <p className="text-sm font-semibold">CRM Mode: READ ONLY</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Pipeline: DEALERSHIP · Source: CRM · Model 31 Access: READ ONLY
      </p>
      <p
        className="mt-1 text-xs text-[var(--text-muted)]"
        title="Model 31 does not modify dealership leads."
      >
        Model 31 does not modify dealership leads.
      </p>
    </div>
  )
}
