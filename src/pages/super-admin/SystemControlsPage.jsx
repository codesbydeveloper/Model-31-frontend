import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Toggle from '../../components/common/Toggle'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useToast } from '../../hooks/useToast'
import systemControlService from '../../services/mock/systemControlService'

const GROUPS = [
  { key: 'salesperson', title: 'Salesperson Control' },
  { key: 'dealership', title: 'Dealership Control' },
  { key: 'social', title: 'Social Posting Control' },
  { key: 'autonomy', title: 'System Autonomy Control' },
]

export default function SystemControlsPage() {
  const { showToast } = useToast()
  const [controls, setControls] = useState(null)
  const [labels, setLabels] = useState({})
  const [critical, setCritical] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, status] = await Promise.all([
        systemControlService.getSystemControls(),
        systemControlService.getControlStatusSummary(),
      ])
      setControls(data.controls)
      setLabels(data.labels)
      setCritical(data.critical)
      setSummary(status)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const applyToggle = async (group, key, value) => {
    await systemControlService.updateSystemControl(group, key, value)
    showToast(`${labels[key] || key} ${value ? 'enabled' : 'disabled'}.`)
    await load()
  }

  const onToggle = (group, key, next) => {
    if (!next && critical.includes(key)) {
      setPending({ group, key, next })
      return
    }
    void applyToggle(group, key, next)
  }

  if (loading || !controls || !summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title="System Control Center"
        description="Control platform automation, AI behavior, dispatch, social publishing and dealership operations."
      />

      <Card className="mb-5">
        <h2 className="mb-3 text-base font-semibold">Control Status</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['System Autonomy', summary.systemAutonomy],
            ['Lead Dispatch', summary.leadDispatch],
            ['AI Conversation', summary.aiConversation],
            ['CRM Sync', summary.crmSync],
            ['Social Publishing', summary.socialPublishing],
          ].map(([label, status]) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
            >
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <div className="mt-1">
                <StatusBadge status={status} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {GROUPS.map((group) => (
          <Card key={group.key}>
            <h2 className="mb-4 text-base font-semibold">{group.title}</h2>
            <div className="space-y-4">
              {Object.entries(controls[group.key]).map(([key, value]) => (
                <Toggle
                  key={key}
                  label={labels[key] || key}
                  description={value ? 'ON' : 'OFF'}
                  checked={value}
                  onChange={(next) => onToggle(group.key, key, next)}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return
          await applyToggle(pending.group, pending.key, pending.next)
          setPending(null)
        }}
        title={`Disable ${labels[pending?.key] || 'feature'}?`}
        message="Disabling this feature may prevent qualified leads from being automatically dispatched or other automation from running."
        confirmLabel="Disable"
        danger
      />
    </div>
  )
}
