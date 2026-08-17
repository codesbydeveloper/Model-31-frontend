import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Toggle from '../../components/common/Toggle'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import crmService from '../../services/mock/crmService'
import CrmReadOnlyBanner from '../../components/leads/CrmReadOnlyBanner'

export default function DealershipCrmPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    autoSync: true,
    leadSync: true,
    customerSync: true,
    appointmentSync: true,
    soldDealSync: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dash, act] = await Promise.all([
        crmService.getDealershipCrmDashboard(),
        crmService.getCRMActivity(),
      ])
      setData(dash)
      setActivity(act.slice(0, 12))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !data) {
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
        title="CRM Sync"
        description="Monitor dealership CRM synchronization and activity."
        actions={<StatusBadge status={data.status} />}
      />

      <CrmReadOnlyBanner className="mb-5" />

      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Connected CRM</p>
            <p className="text-xl font-semibold">{data.crmName}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Last Sync: {data.lastSync}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={syncing}
              onClick={async () => {
                setSyncing(true)
                try {
                  await crmService.syncCRM('crm_vinsolutions')
                  showToast('Sync completed successfully.')
                  await load()
                } finally {
                  setSyncing(false)
                }
              }}
            >
              {syncing ? (
                <>
                  <LoadingSpinner size={16} />
                  Syncing CRM...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync Now
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setActivityOpen(true)}>
              View Activity
            </Button>
            <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
              Settings
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Leads Synced" value={formatNumber(data.leadsSynced)} />
        <StatCard label="Customers Synced" value={formatNumber(data.customersSynced)} />
        <StatCard label="Appointments Synced" value={formatNumber(data.appointmentsSynced)} />
        <StatCard label="Sold Deals Synced" value={formatNumber(data.soldDealsSynced)} />
        <StatCard label="Sync Errors" value={formatNumber(data.syncErrors)} />
      </div>

      <Modal open={activityOpen} onClose={() => setActivityOpen(false)} title="CRM Activity">
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {activity.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.event}</p>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {item.crm} · {item.time}
              </p>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="CRM Settings">
        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <Toggle
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              checked={value}
              onChange={(next) => {
                setSettings((prev) => ({ ...prev, [key]: next }))
                showToast('Setting updated (mock).')
              }}
            />
          ))}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
