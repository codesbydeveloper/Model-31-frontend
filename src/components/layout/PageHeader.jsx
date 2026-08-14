import { Search, Filter, Plus } from 'lucide-react'
import Button from '../common/Button'
import { cn } from '../../utils/cn'

/**
 * Layout page header with optional visual action placeholders.
 * Business actions will be wired in later steps.
 */
export default function PageHeader({
  title,
  description,
  actions,
  showPlaceholders = false,
  className = '',
}) {
  const placeholderActions = showPlaceholders ? (
    <>
      <Button variant="secondary" size="sm" type="button" disabled title="Coming soon">
        <Search size={14} />
        <span className="hidden sm:inline">Search</span>
      </Button>
      <Button variant="secondary" size="sm" type="button" disabled title="Coming soon">
        <Filter size={14} />
        <span className="hidden sm:inline">Filter</span>
      </Button>
      <Button size="sm" type="button" disabled title="Coming soon">
        <Plus size={14} />
        <span className="hidden sm:inline">Add</span>
      </Button>
    </>
  ) : null

  return (
    <div
      className={cn(
        'mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {(actions || placeholderActions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions || placeholderActions}
        </div>
      )}
    </div>
  )
}
