import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { buildBreadcrumbs } from '../../routes/navigation'
import { cn } from '../../utils/cn'

export default function Breadcrumbs({ className = '', items }) {
  const { user } = useAuth()
  const location = useLocation()
  const crumbs = items || buildBreadcrumbs(location.pathname, user?.role)

  if (!crumbs?.length) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('mb-3 overflow-x-auto scrollbar-none', className)}
    >
      <ol className="flex min-w-0 items-center gap-1 text-sm text-[var(--text-muted)]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li
              key={`${crumb.path}-${crumb.label}`}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span className="truncate font-medium text-[var(--text-primary)]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="truncate hover:text-[var(--brand-accent)]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
