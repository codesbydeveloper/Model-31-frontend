import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Toggle from '../../components/common/Toggle'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import crmService from '../../services/mock/crmService'

const TABS = ['Connection', 'Synchronization', 'Field Mapping', 'Activity', 'Health']

export default function CrmIntegrationDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [errors, setErrors] = useState([])
  const [activity, setActivity] = useState([])
  const [tab, setTab] = useState(params.get('tab') || 'Connection')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [crm, errs, act] = await Promise.all([
        crmService.getCRMById(id),
        crmService.getCRMSyncErrors(id),
        crmService.getCRMActivity(id),
      ])
      setItem(crm)
      setErrors(errs)
      setActivity(act)
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
        <h1 className="text-xl font-semibold">CRM not found</h1>
        <Link to="/super-admin/crm-integrations" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const update = async (payload) => {
    const updated = await crmService.updateCRMSettings(id, payload)
    setItem(updated)
    showToast('Settings updated.')
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/crm-integrations">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.name}
        description={`${item.environment} · Connected ${item.connectedDate}`}
        actions={<StatusBadge status={item.status} />}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={syncing || item.status === 'DISCONNECTED'}
          onClick={async () => {
            setSyncing(true)
            try {
              await crmService.syncCRM(id)
              showToast('Sync completed successfully.')
              await load()
            } finally {
              setSyncing(false)
            }
          }}
        >
          {syncing ? (
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
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InfoCard label="Last Sync" value={item.lastSync} />
        <InfoCard label="Next Sync" value={item.nextSync} />
        <InfoCard label="Records Synced" value={formatNumber(item.recordsSynced)} />
        <InfoCard label="Errors" value={formatNumber(item.syncErrors)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={tab === name ? 'primary' : 'secondary'}
            onClick={() => setTab(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {tab === 'Connection' && (
        <Card className="grid gap-4">
          <Select
            label="Environment"
            value={item.environment}
            onChange={(e) => update({ environment: e.target.value })}
            options={[
              { value: 'Production', label: 'Production' },
              { value: 'Sandbox', label: 'Sandbox' },
            ]}
          />
          <Select
            label="Sync Frequency"
            value={item.syncFrequency}
            onChange={(e) => update({ syncFrequency: e.target.value })}
            options={[
              { value: 'Every 15 minutes', label: 'Every 15 minutes' },
              { value: 'Hourly', label: 'Hourly' },
              { value: 'Daily', label: 'Daily' },
            ]}
          />
          <Select
            label="Timezone"
            value={item.timezone}
            onChange={(e) => update({ timezone: e.target.value })}
            options={[
              { value: 'America/New_York', label: 'America/New_York' },
              { value: 'America/Chicago', label: 'America/Chicago' },
              { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
            ]}
          />
          <Toggle
            label="Auto Sync"
            checked={item.autoSync}
            onChange={(next) => update({ autoSync: next })}
          />
          <Toggle
            label="Lead Sync"
            checked={item.leadSync}
            onChange={(next) => update({ leadSync: next })}
          />
          <Toggle
            label="Customer Sync"
            checked={item.customerSync}
            onChange={(next) => update({ customerSync: next })}
          />
          <Toggle
            label="Appointment Sync"
            checked={item.appointmentSync}
            onChange={(next) => update({ appointmentSync: next })}
          />
          <Toggle
            label="Sold Deal Sync"
            checked={item.soldDealSync}
            onChange={(next) => update({ soldDealSync: next })}
          />
        </Card>
      )}

      {tab === 'Synchronization' && (
        <Card>
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
                  row.status === 'FAILED' ? (
                    <Button
                      size="sm"
                      onClick={async () => {
                        await crmService.retryCRMError(row.id)
                        showToast('Retry started.')
                        await load()
                      }}
                    >
                      Retry
                    </Button>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={errors}
            pageSize={8}
            emptyTitle="No sync errors for this CRM."
          />
        </Card>
      )}

      {tab === 'Field Mapping' && (
        <Card>
          <DataTable
            columns={[
              { key: 'source', label: 'Model 31 Field' },
              { key: 'target', label: 'CRM Field' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={item.fieldMappings || []}
            pageSize={10}
          />
        </Card>
      )}

      {tab === 'Activity' && (
        <Card>
          <ul className="space-y-2">
            {activity.map((a) => (
              <li
                key={a.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{a.event}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{a.time}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'Health' && (
        <Card>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">Latency</dt>
              <dd className="text-lg font-semibold">{item.health?.latencyMs} ms</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Uptime</dt>
              <dd className="text-lg font-semibold">{item.health?.uptime}%</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Last Check</dt>
              <dd className="text-lg font-semibold">{item.health?.lastCheck}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </Card>
  )
}
