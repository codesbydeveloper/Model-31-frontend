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
  nextStepNote = 'Open a related page from the sidebar to continue.',
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title={title}
        description={description}
        showPlaceholders={false}
      />
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
          {subtitle || title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {nextStepNote}
        </p>
      </Card>
    </div>
  )
}
