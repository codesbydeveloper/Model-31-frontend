import Card from '../common/Card'
import Breadcrumbs from './Breadcrumbs'
import PageHeader from './PageHeader'

/**
 * Professional placeholder for modules not yet implemented.
 */
export default function PlaceholderPage({
  title,
  subtitle,
  description,
  showActionPlaceholders = true,
  nextStepNote = 'This module will be implemented in the next steps.',
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title={title}
        description={description}
        showPlaceholders={showActionPlaceholders}
      />
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
          {subtitle || title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {nextStepNote}
        </p>
        <div className="mt-5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-muted)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Module workspace placeholder
        </div>
      </Card>
    </div>
  )
}
