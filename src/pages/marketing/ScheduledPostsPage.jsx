import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import ConfirmModal from '../../components/common/ConfirmModal'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import {
  getScheduledPosts,
  getScheduledPostsCalendar,
  getScheduledPost,
  rescheduleScheduledPost,
  cancelScheduledPost,
} from '../../services/api/marketingScheduledPostService'

const PAGE_SIZE = 10
const DEFAULT_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
]

export default function ScheduledPostsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [groups, setGroups] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [reschedule, setReschedule] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [timezones, setTimezones] = useState(DEFAULT_TIMEZONES)
  const [form, setForm] = useState({ date: '', time: '', timezone: 'America/New_York' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (view === 'calendar') {
        setGroups(await getScheduledPostsCalendar())
      } else {
        const result = await getScheduledPosts({ page, limit: PAGE_SIZE })
        setRows(result.items)
        setTotalItems(result.total)
        if (result.items.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1))
        }
      }
    } catch (err) {
      setRows([])
      setGroups([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load scheduled posts.', 'error')
    } finally {
      setLoading(false)
    }
  }, [view, page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const openReschedule = async (item) => {
    setReschedule(item)
    setForm({
      date: item.date,
      time: item.time,
      timezone: item.timezone || 'America/New_York',
    })
    try {
      const detail = await getScheduledPost(item.id)
      if (detail.post) {
        setReschedule(detail.post)
        setForm({
          date: detail.post.date,
          time: detail.post.time,
          timezone: detail.post.timezone || 'America/New_York',
        })
      }
      if (detail.timezones?.length) setTimezones(detail.timezones)
    } catch (err) {
      showToast(err.message || 'Unable to load scheduled post.', 'error')
    }
  }

  const showActions = (row) => row.status === 'SCHEDULED' || row.canReschedule || row.canCancel

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Scheduled Posts"
        description="Model 31 does not auto-publish. This list is a reminder only — the salesperson copies the script into CapCut or Instagram."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === 'calendar' ? 'primary' : 'secondary'}
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
            <Button
              size="sm"
              variant={view === 'list' ? 'primary' : 'secondary'}
              onClick={() => {
                setView('list')
                setPage(1)
              }}
            >
              List
            </Button>
          </div>
        }
      />

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : view === 'calendar' ? (
          <div className="space-y-4">
            {groups.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">No scheduled posts.</p>
            )}
            {groups.map((group) => (
              <div key={group.date}>
                <h3 className="mb-2 text-sm font-semibold">{group.date}</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-3"
                    >
                      <p className="font-medium">{item.contentTitle}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <PlatformBadge platform={item.platform} />
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {item.time} · {item.dealership}
                      </p>
                      {showActions(item) && (
                        <div className="mt-2 flex gap-2">
                          {item.canReschedule && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void openReschedule(item)}
                            >
                              Reschedule
                            </Button>
                          )}
                          {item.canCancel && (
                            <Button size="sm" variant="ghost" onClick={() => setCancelTarget(item)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'contentTitle', label: 'Content' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              { key: 'dealership', label: 'Dealership' },
              { key: 'date', label: 'Date' },
              { key: 'time', label: 'Time' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) =>
                  showActions(row) ? (
                    <div className="flex flex-wrap gap-1">
                      {row.canReschedule && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void openReschedule(row)}
                        >
                          Reschedule
                        </Button>
                      )}
                      {row.canCancel && (
                        <Button size="sm" variant="ghost" onClick={() => setCancelTarget(row)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No scheduled posts."
          />
        )}
      </Card>

      <Modal
        open={Boolean(reschedule)}
        onClose={() => setReschedule(null)}
        title="Reschedule Post"
      >
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!reschedule) return
            setBusy(true)
            try {
              await rescheduleScheduledPost(reschedule.id, form)
              setReschedule(null)
              showToast('Post rescheduled successfully.')
              await load()
            } catch (err) {
              showToast(err.message || 'Unable to reschedule post.', 'error')
            } finally {
              setBusy(false)
            }
          }}
        >
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            options={timezones.map((zone) => ({ value: zone, label: zone }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setReschedule(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <LoadingSpinner size={16} /> : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return
          setBusy(true)
          try {
            await cancelScheduledPost(cancelTarget.id)
            setCancelTarget(null)
            showToast('Scheduled post cancelled.')
            await load()
          } catch (err) {
            showToast(err.message || 'Unable to cancel scheduled post.', 'error')
          } finally {
            setBusy(false)
          }
        }}
        title="Cancel scheduled post?"
        message="Are you sure you want to cancel this scheduled post?"
        confirmLabel="Cancel Post"
        danger
        loading={busy}
      />
    </div>
  )
}
