import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Select from '../../components/common/Select'
import { useToast } from '../../hooks/useToast'
import notificationService from '../../services/mock/notificationService'

export default function PlatformNotificationsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await notificationService.getNotifications())
    } finally {
      setLoading(false)
    }
  }, [])

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

  const unread = rows.filter((r) => !r.read).length

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <PageHeader
        title="Platform Notifications"
        description={`${unread} unread system alerts across CRM, AI, dispatch and social.`}
        actions={
          <Button
            variant="secondary"
            onClick={async () => {
              await notificationService.markAllNotificationsRead()
              showToast('All notifications marked as read.')
              await load()
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
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={item.severity} />
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
      </Card>
    </div>
  )
}
