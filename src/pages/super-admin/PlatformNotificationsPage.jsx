import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Select from '../../components/common/Select'
import { useToast } from '../../hooks/useToast'
import notificationService from '../../services/api/notificationService'
import { Link } from 'react-router-dom'

const PAGE_SIZE = 10

function visiblePages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export default function PlatformNotificationsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await notificationService.getNotificationPage({ page, limit: PAGE_SIZE })
      setRows(result.items)
      setTotal(result.total)
      setUnreadCount(result.unreadCount)
    } catch (err) {
      setRows([])
      setTotal(0)
      setUnreadCount(0)
      showToast(err.message || 'Unable to load notifications.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.category))].sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    if (category === 'all') return rows
    return rows.filter((r) => r.category === category)
  }, [rows, category])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = rows.length === 0 ? 0 : from + rows.length - 1

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <PageHeader
        title="Platform Notifications"
        description={`${unreadCount} unread system alerts across CRM, AI, dispatch and social.`}
        actions={
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await notificationService.markAllNotificationsRead()
                showToast('All notifications marked as read.')
                await load()
              } catch (err) {
                showToast(err.message || 'Unable to mark notifications as read.', 'error')
              }
            }}
          >
            Mark All Read
          </Button>
        }
      />

      <Card>
        <div className="mb-4 max-w-sm">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className={`rounded-[var(--radius-md)] border px-4 py-3 ${
                  item.read
                    ? 'border-[var(--border-default)]'
                    : 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">{item.category}</p>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{item.date}</p>
                    {item.category === 'Deal Ready for Review' && (
                      <div className="mt-3 space-y-1 text-sm">
                        <p>Customer: {item.customer}</p>
                        <p>Vehicle: {item.vehicle}</p>
                        <p>Lead Score: {item.leadScore}</p>
                        <p>Intent: {item.intent}</p>
                        <p>Deal Status: {item.dealStatus}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={item.severity} />
                    {item.category === 'Deal Ready for Review' && (
                      <>
                        <Link to={`/super-admin/deal-handoffs/${item.handoffId}`}>
                          <Button size="sm">Review Deal</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await notificationService.dismissNotification(item.id)
                            showToast('Alert dismissed.')
                            await load()
                          }}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {!item.read && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          await notificationService.markNotificationRead(item.id)
                          showToast('Marked as read.')
                          await load()
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && (
          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-default)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Showing {from}–{to} of {total}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
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
                  onClick={() => setPage(pageNumber)}
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
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
