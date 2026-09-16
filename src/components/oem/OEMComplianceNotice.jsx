export default function OEMComplianceNotice({ title, body }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <span className="badge badge-pending">READ-ONLY</span>
      </div>
      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--text-secondary)]">
        {body}
      </p>
    </div>
  )
}
