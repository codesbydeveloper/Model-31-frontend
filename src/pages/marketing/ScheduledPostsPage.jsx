import { useCallback, useEffect, useMemo, useState } from 'react'
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
import scheduledPostService from '../../services/mock/scheduledPostService'

export default function ScheduledPostsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [reschedule, setReschedule] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', timezone: 'America/New_York' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await scheduledPostService.getScheduledPosts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const byDate = useMemo(() => {
    const map = {}
    rows
      .filter((r) => r.status === 'SCHEDULED')
      .forEach((r) => {
        map[r.date] = map[r.date] || []
        map[r.date].push(r)
      })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Scheduled Posts"
        description="Calendar and list of scheduled marketing content."
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
              onClick={() => setView('list')}
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
            {byDate.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">No scheduled posts.</p>
            )}
            {byDate.map(([date, items]) => (
              <div key={date}>
                <h3 className="mb-2 text-sm font-semibold">{date}</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
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
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setReschedule(item)
                            setForm({
                              date: item.date,
                              time: item.time,
                              timezone: item.timezone,
                            })
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setCancelTarget(item)}>
                          Cancel
                        </Button>
                      </div>
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
                  row.status === 'SCHEDULED' ? (
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setReschedule(row)
                          setForm({
                            date: row.date,
                            time: row.time,
                            timezone: row.timezone,
                          })
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setCancelTarget(row)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={rows}
            pageSize={10}
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
            setBusy(true)
            try {
              await scheduledPostService.reschedulePost(reschedule.id, form)
              setReschedule(null)
              showToast('Post rescheduled successfully.')
              await load()
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
            options={[
              { value: 'America/New_York', label: 'America/New_York' },
              { value: 'America/Chicago', label: 'America/Chicago' },
              { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setReschedule(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          setBusy(true)
          try {
            await scheduledPostService.cancelScheduledPost(cancelTarget.id)
            setCancelTarget(null)
            showToast('Scheduled post cancelled.')
            await load()
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
