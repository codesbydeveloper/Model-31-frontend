import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Toggle from '../../components/common/Toggle'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import ErrorState from '../../components/ui/ErrorState'
import { useToast } from '../../hooks/useToast'
import {
  getSystemControls,
  setNuclearMode,
  setSystemControlToggle,
  updateSystemControls,
} from '../../services/api/superAdminSystemControlsService'

const TOGGLE_FLUSH_MS = 400

function patchToggle(page, key, enabled) {
  if (!page) return page
  return {
    ...page,
    groups: page.groups.map((group) => ({
      ...group,
      toggles: group.toggles.map((toggle) =>
        toggle.key === key
          ? { ...toggle, enabled, status: enabled ? 'ON' : 'OFF' }
          : toggle,
      ),
    })),
  }
}

export default function SystemControlsPage() {
  const { showToast } = useToast()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [savingKey, setSavingKey] = useState(null)
  const [pending, setPending] = useState(null)
  const [nuclearPending, setNuclearPending] = useState(null)
  const [nuclearLoading, setNuclearLoading] = useState(false)
  const queuedRef = useRef({})
  const labelsRef = useRef({})
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setPage(await getSystemControls())
    } catch (err) {
      setPage(null)
      setError(true)
      showToast(err.message || 'Unable to load system controls.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const flushToggles = useCallback(async () => {
    const queued = queuedRef.current
    queuedRef.current = {}
    const labels = labelsRef.current
    labelsRef.current = {}
    const entries = []
    Object.entries(queued).forEach(([groupId, values]) => {
      Object.entries(values).forEach(([key, enabled]) => {
        entries.push({ groupId, key, enabled, label: labels[key] || key })
      })
    })
    if (!entries.length) return

    setSavingKey(entries.length === 1 ? entries[0].key : 'bulk')
    try {
      let next
      if (entries.length === 1) {
        next = await setSystemControlToggle(entries[0].key, entries[0].enabled)
        showToast(
          next.message ||
            `${entries[0].label} ${entries[0].enabled ? 'enabled' : 'disabled'}.`,
        )
      } else {
        next = await updateSystemControls(queued)
        showToast(next.message || 'Controls updated.')
      }
      setPage(next)
    } catch (err) {
      showToast(err.message || 'Unable to update controls.', 'error')
      try {
        setPage(await getSystemControls())
      } catch {
        // keep optimistic values if reload also fails
      }
    } finally {
      setSavingKey(null)
      setPending(null)
    }
  }, [showToast])

  const queueToggle = (groupId, key, enabled, label) => {
    setPage((current) => patchToggle(current, key, enabled))
    queuedRef.current = {
      ...queuedRef.current,
      [groupId]: {
        ...(queuedRef.current[groupId] || {}),
        [key]: enabled,
      },
    }
    labelsRef.current = { ...labelsRef.current, [key]: label }
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => void flushToggles(), TOGGLE_FLUSH_MS)
  }

  const onToggle = (groupId, toggle, next) => {
    if (!next && toggle.critical) {
      setPending({ groupId, ...toggle, next })
      return
    }
    queueToggle(groupId, toggle.key, next, toggle.label)
  }

  const applyNuclear = async (enabled) => {
    setNuclearLoading(true)
    try {
      const next = await setNuclearMode(enabled)
      setPage(next)
      showToast(next.message || `Nuclear Mode ${enabled ? 'enabled' : 'disabled'}.`)
      setNuclearPending(null)
    } catch (err) {
      showToast(err.message || 'Unable to update Nuclear Mode.', 'error')
    } finally {
      setNuclearLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error || !page) {
    return <ErrorState onRetry={load} />
  }

  const busy = Boolean(savingKey) || nuclearLoading
  const nuclear = page.nuclearMode

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader title={page.pageTitle} description={page.description} />

      <Card className="mb-5">
        <h2 className="mb-3 text-base font-semibold">Control Status</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {page.controlStatus.map((item) => (
            <div
              key={item.key}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
            >
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              <div className="mt-1">
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-5 border-[var(--brand-primary)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Nuclear Mode</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{nuclear.description}</p>
          </div>
          <StatusBadge status={nuclear.status} />
        </div>
        <div className="mt-4">
          <Toggle
            label="Nuclear Mode"
            description={nuclear.enabled ? 'ON' : 'OFF'}
            checked={nuclear.enabled}
            disabled={busy}
            onChange={(next) => setNuclearPending(next)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {page.groups.map((group) => (
          <Card key={group.id}>
            <h2 className="mb-4 text-base font-semibold">{group.title}</h2>
            <div className="space-y-4">
              {group.toggles.map((toggle) => (
                <Toggle
                  key={toggle.key}
                  label={toggle.label}
                  description={toggle.enabled ? 'ON' : 'OFF'}
                  checked={toggle.enabled}
                  disabled={busy}
                  onChange={(next) => onToggle(group.id, toggle, next)}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          queueToggle(pending.groupId, pending.key, pending.next, pending.label)
          setPending(null)
        }}
        title={`Disable ${pending?.label || 'feature'}?`}
        message="Disabling this feature may prevent qualified leads from being automatically dispatched or other automation from running."
        confirmLabel="Disable"
        danger
        loading={savingKey === pending?.key}
      />
      <ConfirmModal
        open={nuclearPending === true}
        onClose={() => setNuclearPending(null)}
        onConfirm={() => void applyNuclear(true)}
        title="Enable Nuclear Mode?"
        message="Nuclear Mode enables advanced deal-assistance features. All actions remain subject to dealership controls and negotiation limits."
        confirmLabel="Enable Nuclear Mode"
        loading={nuclearLoading}
      />
      <ConfirmModal
        open={nuclearPending === false}
        onClose={() => setNuclearPending(null)}
        onConfirm={() => void applyNuclear(false)}
        title="Disable Nuclear Mode?"
        message="Advanced deal-assistance features will be disabled."
        confirmLabel="Disable"
        danger
        loading={nuclearLoading}
      />
    </div>
  )
}
