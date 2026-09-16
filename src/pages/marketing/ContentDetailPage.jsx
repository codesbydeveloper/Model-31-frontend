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
import {
  getMarketingContentById,
  updateMarketingContent,
  sendScriptToSalesperson,
  getMarketingSalespeople,
  approveMarketingContent,
  joinHashtags,
} from '../../services/api/marketingContentService'
import {
  getApprovalItem,
  updateApprovalItem,
  approveApprovalItem,
} from '../../services/api/marketingApprovalService'
import { SOCIAL_PLATFORMS } from '../../data/marketingContent'

export default function ContentDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const fromApproval = params.get('from') === 'approval'
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(params.get('edit') === '1')
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendSalespeople, setSendSalespeople] = useState([])
  const [sendSalespersonId, setSendSalespersonId] = useState('')
  const [sendLoading, setSendLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = fromApproval
        ? await getApprovalItem(id)
        : await getMarketingContentById(id)
      setItem(data)
      if (data) {
        setForm({
          title: data.title,
          body: data.body,
          hashtags: joinHashtags(data.hashtags),
          platform: data.platform || 'Instagram',
          caption: data.caption || data.title,
          script: data.script || data.body,
          cta: data.cta || '',
          leadId: data.leadId || '',
        })
      }
    } catch (err) {
      setItem(null)
      showToast(err.message || 'Unable to load content.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, fromApproval, showToast])

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
        <Link to={fromApproval ? '/marketing/approval' : '/marketing/content'} className="mt-4 inline-block">
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
        <Link to={fromApproval ? '/marketing/approval' : '/marketing/content'}>
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
        {(item.status === 'DRAFT' || item.status === 'REJECTED') && !fromApproval && (
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setSendOpen(true)
              setSendSalespersonId('')
              setSendSalespeople([])
              setSendLoading(true)
              try {
                const list = await getMarketingSalespeople(item.dealershipId)
                setSendSalespeople(list)
                if (list.length === 1) setSendSalespersonId(list[0].id)
              } catch (err) {
                showToast(err.message || 'Unable to load salespeople.', 'error')
              } finally {
                setSendLoading(false)
              }
            }}
          >
            Send to Salesperson
          </Button>
        )}
        {item.status === 'PENDING APPROVAL' && (
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                const updated = fromApproval
                  ? await approveApprovalItem(item.id)
                  : await approveMarketingContent(item.id)
                setItem(updated)
                showToast('Script approved for the salesperson.')
              } catch (err) {
                showToast(err.message || 'Unable to approve content.', 'error')
              } finally {
                setBusy(false)
              }
            }}
          >
            Approve
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          {editing ? (
            <div className="grid gap-3">
              <Select
                label="Platform"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                options={SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp').map((p) => ({
                  value: p,
                  label: p,
                }))}
              />
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
                    const updated = fromApproval
                      ? await updateApprovalItem(item.id, form)
                      : await updateMarketingContent(item.id, form)
                    setItem(updated)
                    setEditing(false)
                    showToast('Content updated.')
                  } catch (err) {
                    showToast(err.message || 'Unable to update content.', 'error')
                  } finally {
                    setBusy(false)
                  }
                }}
                disabled={busy}
              >
                {busy ? <LoadingSpinner size={16} /> : 'Save Changes'}
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
          title={editing ? form.title : item.caption || item.title}
          body={editing ? form.body : item.script || item.body}
          hashtags={hashtags}
          hideMedia
        />
      </div>

      {item.contentType === 'Video Script' && (item.scenes || []).length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 text-base font-semibold">Scene structure</h2>
          <ul className="space-y-2">
            {item.scenes.map((scene) => (
              <li
                key={scene.scene}
                className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              >
                <p className="font-medium">Scene {scene.scene}</p>
                <p className="text-[var(--text-secondary)]">{scene.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="text-base font-semibold">Activity History</h2>
        {(item.activity || []).length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">No activity yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {item.activity.map((a) => (
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
        )}
      </Card>

      <Modal
        open={sendOpen}
        onClose={() => {
          setSendOpen(false)
          setSendSalespersonId('')
        }}
        title="Send to Salesperson"
      >
        {sendLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size={24} />
          </div>
        ) : sendSalespeople.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            No salespeople found for this dealership.
          </p>
        ) : (
          <Select
            label="Salesperson"
            value={sendSalespersonId}
            onChange={(e) => setSendSalespersonId(e.target.value)}
            placeholder="Select salesperson"
            options={sendSalespeople.map((person) => ({
              value: person.id,
              label: person.label,
            }))}
          />
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setSendOpen(false)
              setSendSalespersonId('')
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={busy || sendLoading || !sendSalespersonId}
            onClick={async () => {
              setBusy(true)
              try {
                const updated = await sendScriptToSalesperson(item.id, {
                  salespersonId: sendSalespersonId,
                })
                setItem(updated === true ? item : updated)
                setSendOpen(false)
                showToast('Script sent to the salesperson.')
              } catch (err) {
                showToast(err.message || 'Unable to send script.', 'error')
              } finally {
                setBusy(false)
              }
            }}
          >
            Send
          </Button>
        </div>
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
