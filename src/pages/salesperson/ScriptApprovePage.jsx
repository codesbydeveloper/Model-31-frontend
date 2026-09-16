import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ScriptTools from '../../components/scripts/ScriptTools'
import { approvePublicScript, getPublicScript } from '../../services/api/salespersonScriptService'

export default function ScriptApprovePage() {
  const { token } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await getPublicScript(token))
    } catch (err) {
      setItem(null)
      setError(err.message || 'Unable to load script.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const approve = async () => {
    setSaving(true)
    setError('')
    try {
      const next = await approvePublicScript(token)
      setItem(
        typeof next === 'object'
          ? next
          : { ...item, status: 'APPROVED', copyEnabled: true },
      )
      setMessage('Approved. Copy the script and paste it into CapCut or Instagram.')
    } catch (err) {
      setError(err.message || 'Unable to approve.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (!item) {
    return (
      <Card>
        <h1 className="text-lg font-semibold">Script not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
      </Card>
    )
  }

  const copyEnabled = Boolean(item.copyEnabled)

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Model 31 sales script
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{item.customerName}</h1>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {item.vehicle} · {item.platform}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm">{item.script}</p>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{item.caption}</p>
      {!copyEnabled && item.status === 'PENDING' && (
        <Button className="mt-5 w-full" onClick={() => void approve()} disabled={saving}>
          {saving ? <LoadingSpinner size={16} /> : 'Approve'}
        </Button>
      )}
      {message ? <p className="mt-3 text-sm text-[var(--status-ready)]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-[var(--status-error)]">{error}</p> : null}
      <div className="mt-5 border-t border-[var(--border-default)] pt-4">
        <ScriptTools
          script={item.script}
          caption={item.caption}
          copyEnabled={copyEnabled}
          onCopied={(text) => setMessage(text)}
        />
      </div>
    </Card>
  )
}
