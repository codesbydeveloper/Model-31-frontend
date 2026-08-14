import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ContentPreview from '../../components/marketing/ContentPreview'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import marketingContentService from '../../services/mock/marketingContentService'
import scheduledPostService from '../../services/mock/scheduledPostService'
import { DEALERSHIPS, SOCIAL_PLATFORMS } from '../../data/marketingContent'

export default function ContentDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(params.get('edit') === '1')
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [schedule, setSchedule] = useState({
    platform: 'Instagram',
    dealership: DEALERSHIPS[0],
    date: '2026-08-20',
    time: '10:00',
    timezone: 'America/New_York',
    campaign: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await marketingContentService.getContentById(id)
      setItem(data)
      if (data) {
        setForm({
          title: data.title,
          body: data.body,
          hashtags: (data.hashtags || []).join(' '),
        })
        setSchedule((s) => ({
          ...s,
          platform: data.platform,
          dealership: data.dealership,
          campaign: data.campaign,
        }))
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Content not found</h1>
        <Link to="/marketing/content" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const hashtags = editing
    ? String(form.hashtags || '')
        .split(/[\s,]+/)
        .filter(Boolean)
    : item.hashtags || []

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/content">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.title}
        description={`${item.contentType} · ${item.dealership}`}
        actions={<StatusBadge status={item.status} />}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Cancel Edit' : 'Edit'}
        </Button>
        {(item.status === 'DRAFT' || item.status === 'REJECTED') && (
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                const updated = await marketingContentService.submitForApproval(item.id)
                setItem(updated)
                showToast('Submitted for approval.')
              } finally {
                setBusy(false)
              }
            }}
          >
            Submit for Approval
          </Button>
        )}
        {item.status === 'APPROVED' && (
          <Button size="sm" onClick={() => setScheduleOpen(true)}>
            Schedule Post
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          {editing ? (
            <div className="grid gap-3">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Content</label>
                <textarea
                  className="input-field min-h-32"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>
              <Input
                label="Hashtags"
                value={form.hashtags}
                onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              />
              <Button
                onClick={async () => {
                  setBusy(true)
                  try {
                    const updated = await marketingContentService.updateContent(item.id, {
                      title: form.title,
                      body: form.body,
                      hashtags,
                    })
                    setItem(updated)
                    setEditing(false)
                    showToast('Content updated.')
                  } finally {
                    setBusy(false)
                  }
                }}
                disabled={busy}
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <dl className="space-y-2 text-sm">
              <Info label="Platform" value={<PlatformBadge platform={item.platform} />} />
              <Info label="Campaign" value={item.campaign || '—'} />
              <Info label="Audience" value={item.audience} />
              <Info label="Tone" value={item.tone} />
              <Info label="Language" value={item.language} />
              <Info label="Vehicle" value={item.vehicle || '—'} />
              <Info label="Offer" value={item.offer || '—'} />
              {item.rejectionReason && (
                <Info label="Rejection Reason" value={item.rejectionReason} />
              )}
              <div>
                <dt className="text-[var(--text-secondary)]">Body</dt>
                <dd className="mt-1 whitespace-pre-wrap font-medium">{item.body}</dd>
              </div>
            </dl>
          )}
        </Card>
        <ContentPreview
          platform={item.platform}
          title={editing ? form.title : item.title}
          body={editing ? form.body : item.body}
          hashtags={hashtags}
          imageUrl={item.imageUrl}
        />
      </div>

      <Card className="mt-4">
        <h2 className="text-base font-semibold">Activity History</h2>
        <ul className="mt-3 space-y-2">
          {(item.activity || []).map((a) => (
            <li
              key={a.id}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
            >
              <p className="font-medium">{a.description}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {a.actor} · {a.time}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Post">
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            try {
              await scheduledPostService.schedulePost({
                ...schedule,
                contentId: item.id,
                contentTitle: item.title,
              })
              const updated = await marketingContentService.getContentById(item.id)
              setItem(updated)
              setScheduleOpen(false)
              showToast('Post scheduled successfully.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <Select
            label="Platform"
            value={schedule.platform}
            onChange={(e) => setSchedule({ ...schedule, platform: e.target.value })}
            options={SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp').map((p) => ({
              value: p,
              label: p,
            }))}
          />
          <Select
            label="Dealership"
            value={schedule.dealership}
            onChange={(e) => setSchedule({ ...schedule, dealership: e.target.value })}
            options={DEALERSHIPS.map((d) => ({ value: d, label: d }))}
          />
          <Input
            label="Campaign"
            value={schedule.campaign}
            onChange={(e) => setSchedule({ ...schedule, campaign: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={schedule.date}
            onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={schedule.time}
            onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
            required
          />
          <Select
            label="Timezone"
            value={schedule.timezone}
            onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
            options={[
              { value: 'America/New_York', label: 'America/New_York' },
              { value: 'America/Chicago', label: 'America/Chicago' },
              { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <LoadingSpinner size={16} /> : 'Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
