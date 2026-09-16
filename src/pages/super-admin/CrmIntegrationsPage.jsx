import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import CrmReadOnlyBanner from '../../components/leads/CrmReadOnlyBanner'
import {
  getCrmIntegrationsOverview,
  getCrmSyncErrors,
  retryCrmSyncError,
  getCrmActivity,
  syncCrmNow,
  disconnectCrm,
} from '../../services/api/superAdminCrmService'

const EMPTY_METRICS = {
  connectedCrms: 0,
  activeSyncs: 0,
  recordsSyncedToday: 0,
  syncErrors: 0,
  lastSuccessfulSync: '—',
}

export default function CrmIntegrationsPage() {
  const { showToast } = useToast()
  const [banner, setBanner] = useState(null)
  const [summary, setSummary] = useState(EMPTY_METRICS)
  const [items, setItems] = useState([])
  const [activity, setActivity] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [retryingId, setRetryingId] = useState(null)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [overview, errs, act] = await Promise.all([
        getCrmIntegrationsOverview(),
        getCrmSyncErrors(),
        getCrmActivity(),
      ])
      setBanner(overview.banner)
      setSummary(overview.metrics)
      setItems(overview.items)
      setErrors(errs.items)
      setActivity(act)
    } catch (err) {
      setSummary(EMPTY_METRICS)
      setItems([])
      setErrors([])
      setActivity([])
      showToast(err.message || 'Unable to load CRM integrations.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const syncNow = async (id) => {
    setBusyId(id)
    try {
      await syncCrmNow(id)
      showToast('Sync completed successfully.')
      await load()
    } catch (err) {
      showToast(err.message || 'Sync failed.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const retryError = async (errorId) => {
    setRetryingId(errorId)
    try {
      await retryCrmSyncError(errorId)
      showToast('Retry started.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to retry sync error.', 'error')
    } finally {
      setRetryingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="CRM Integrations"
        description="Manage CRM connections, synchronization and integration health across the Model 31 platform."
      />

      <CrmReadOnlyBanner className="mb-5" banner={banner} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Connected CRMs" value={formatNumber(summary.connectedCrms)} />
        <StatCard label="Active Syncs" value={formatNumber(summary.activeSyncs)} />
        <StatCard label="Records Synced Today" value={formatNumber(summary.recordsSyncedToday)} />
        <StatCard label="Sync Errors" value={formatNumber(summary.syncErrors)} />
        <StatCard label="Last Successful Sync" value={summary.lastSuccessfulSync} />
      </div>

      {items.length === 0 ? (
        <Card className="mt-5">
          <EmptyState
            title="No CRM integrations yet."
            description="Connected CRMs will appear here once they are available."
          />
        </Card>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.environment}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Last Sync</dt>
                  <dd className="font-medium">{item.lastSync}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Records Synced</dt>
                  <dd className="font-medium">{formatNumber(item.recordsSynced)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Sync Errors</dt>
                  <dd className="font-medium">{formatNumber(item.syncErrors)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/super-admin/crm-integrations/${item.id}`}>
                  <Button size="sm">View</Button>
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === item.id || item.status === 'DISCONNECTED'}
                  onClick={() => void syncNow(item.id)}
                >
                  {busyId === item.id ? (
                    <>
                      <LoadingSpinner size={14} />
                      Syncing CRM...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Sync Now
                    </>
                  )}
                </Button>
                <Link to={`/super-admin/crm-integrations/${item.id}?tab=Connection`}>
                  <Button size="sm" variant="secondary">
                    Settings
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={item.status === 'DISCONNECTED'}
                  onClick={() => setDisconnectTarget(item)}
                >
                  Disconnect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Sync Errors</h2>
        <DataTable
          columns={[
            { key: 'record', label: 'Record' },
            { key: 'type', label: 'Type' },
            { key: 'message', label: 'Message' },
            { key: 'created', label: 'Created' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'action',
              label: 'Action',
              render: (row) =>
                String(row.status).toUpperCase() === 'FAILED' ? (
                  <Button
                    size="sm"
                    disabled={retryingId === row.id}
                    onClick={() => void retryError(row.id)}
                  >
                    {retryingId === row.id ? <LoadingSpinner size={14} /> : 'Retry'}
                  </Button>
                ) : (
                  '—'
                ),
            },
          ]}
          rows={errors}
          pageSize={6}
          emptyTitle="No sync errors."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">CRM Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No CRM activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 10).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.event}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {[item.crm, item.time].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmModal
        open={Boolean(disconnectTarget)}
        onClose={() => !disconnecting && setDisconnectTarget(null)}
        loading={disconnecting}
        onConfirm={async () => {
          if (!disconnectTarget) return
          setDisconnecting(true)
          try {
            await disconnectCrm(disconnectTarget.id)
            setDisconnectTarget(null)
            showToast('CRM disconnected.')
            await load()
          } catch (err) {
            showToast(err.message || 'Unable to disconnect CRM.', 'error')
          } finally {
            setDisconnecting(false)
          }
        }}
        title="Disconnect CRM?"
        message="This disconnects the CRM. Model 31 will stop syncing this connection."
        confirmLabel="Disconnect"
        danger
      />
    </div>
  )
}
