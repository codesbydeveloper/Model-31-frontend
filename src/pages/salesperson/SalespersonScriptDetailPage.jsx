import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import ScriptTools from '../../components/scripts/ScriptTools'
import {
  approveSalespersonScript,
  editSalespersonScript,
  getSalespersonScript,
} from '../../services/api/salespersonScriptService'

export default function SalespersonScriptDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ script: '', caption: '', cta: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSalespersonScript(id)
      setItem(data)
      setDraft({
        script: data?.script || '',
        caption: data?.caption || '',
        cta: data?.cta || '',
      })
    } catch (err) {
      setItem(null)
      showToast(err.message || 'Unable to load script.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const approve = async () => {
    setSaving(true)
    try {
      const next = await approveSalespersonScript(id)
      setItem(
        typeof next === 'object'
          ? next
          : { ...item, status: 'APPROVED', copyEnabled: true },
      )
      showToast('Script approved.')
    } catch (err) {
      showToast(err.message || 'Unable to approve script.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const next = await editSalespersonScript(id, draft)
      setItem(
        typeof next === 'object'
          ? next
          : { ...item, ...draft, status: 'EDITED', copyEnabled: true },
      )
      setEditing(false)
      showToast('Script updated.')
    } catch (err) {
      showToast(err.message || 'Unable to save script.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <h1 className="text-xl font-semibold">Script not found</h1>
          <Link to="/salesperson/scripts" className="mt-4 inline-block">
            <Button variant="secondary">Back to Scripts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const copyEnabled = Boolean(item.copyEnabled)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/salesperson/scripts">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back to Scripts
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.customerName}
        description={`${item.vehicle} · ${item.platform}`}
        actions={<StatusBadge status={item.status} />}
      />

      <Card>
        <p className="text-sm text-[var(--text-secondary)]">
          These are words only. Model 31 does not create video or auto-publish.
        </p>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Script
          </p>
          {editing ? (
            <textarea
              className="input-field mt-1 min-h-32"
              value={draft.script}
              onChange={(e) => setDraft((current) => ({ ...current, script: e.target.value }))}
            />
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm">{item.script}</p>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Caption
          </p>
          {editing ? (
            <textarea
              className="input-field mt-1 min-h-24"
              value={draft.caption}
              onChange={(e) => setDraft((current) => ({ ...current, caption: e.target.value }))}
            />
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm">{item.caption}</p>
          )}
        </div>
        {editing ? (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              CTA
            </p>
            <input
              className="input-field mt-1"
              value={draft.cta}
              onChange={(e) => setDraft((current) => ({ ...current, cta: e.target.value }))}
            />
          </div>
        ) : item.cta ? (
          <p className="mt-3 text-sm">
            <span className="text-[var(--text-muted)]">CTA: </span>
            {item.cta}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {item.status === 'PENDING' && (
            <Button onClick={() => void approve()} disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Approve'}
            </Button>
          )}
          {editing ? (
            <Button variant="secondary" onClick={() => void saveEdit()} disabled={saving}>
              Save Edit
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="mt-5 border-t border-[var(--border-default)] pt-4">
          <ScriptTools
            script={item.script}
            caption={item.caption}
            copyEnabled={copyEnabled}
            onCopied={(message) => showToast(message)}
          />
        </div>
      </Card>
    </div>
  )
}
