import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from './Button'
import EmptyState from '../ui/EmptyState'

function visiblePages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

/**
 * Responsive data table: desktop table + mobile card list.
 */
export default function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyActionLabel,
  onEmptyAction,
  sortKey,
  sortDir = 'asc',
  onSort,
  page = 1,
  pageSize = 8,
  onPageChange,
  totalItems,
  showPagination = false,
  className = '',
}) {
  const serverPagination = typeof totalItems === 'number'
  const totalCount = serverPagination ? totalItems : rows.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  const pageRows = serverPagination ? rows : rows.slice(start, start + pageSize)
  const from = totalCount === 0 ? 0 : start + 1
  const to = serverPagination
    ? start + pageRows.length
    : Math.min(start + pageSize, totalCount)

  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]',
                    col.sortable && 'cursor-pointer select-none hover:text-[var(--text-primary)]',
                    col.className,
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row[rowKey]}
                className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-muted)]/60"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-3 py-3 align-middle', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {pageRows.map((row) => (
          <div
            key={row[rowKey]}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] py-2 last:border-0"
              >
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  {col.label}
                </span>
                <div className="min-w-0 text-right text-sm text-[var(--text-primary)]">
                  {col.render ? col.render(row) : row[col.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {(showPagination || totalCount > pageSize) && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-default)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {from}–{to} of {totalCount}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            {visiblePages(currentPage, totalPages).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onPageChange?.(pageNumber)}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
