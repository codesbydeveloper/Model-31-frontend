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
import CrmReadOnlyBanner from '../../components/leads/CrmReadOnlyBanner'
import {
  getCrmIntegration,
  syncCrmNow,
  getCrmSettings,
  saveCrmSettings,
  getCrmSynchronization,
  retryCrmSyncError,
  getCrmFieldMapping,
  getCrmIntegrationActivity,
  getCrmHealth,
} from '../../services/api/superAdminCrmService'

const TABS = ['Connection', 'Synchronization', 'Field Mapping', 'Activity', 'Health']

const EMPTY_SETTINGS = {
  environment: 'Production',
  syncFrequency: 'Every 15 minutes',
  timezone: 'America/New_York',
  autoSync: true,
  leadSync: true,
  customerSync: true,
  appointmentSync: true,
  soldDealSync: true,
  options: {
    environments: ['Production', 'Sandbox'],
    frequencies: ['Every 15 minutes', 'Hourly', 'Daily'],
    timezones: ['America/New_York', 'America/Chicago', 'America/Los_Angeles'],
  },
}

export default function CrmIntegrationDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [errors, setErrors] = useState([])
  const [mappings, setMappings] = useState([])
  const [activity, setActivity] = useState([])
  const [health, setHealth] = useState(null)
  const [tab, setTab] = useState(params.get('tab') || 'Connection')
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [retryingId, setRetryingId] = useState(null)

  const loadItem = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await getCrmIntegration(id))
    } catch (err) {
      setItem(null)
      showToast(err.message || 'Unable to load CRM integration.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  const loadTab = useCallback(async () => {
    if (!id) return
    setTabLoading(true)
    try {
      if (tab === 'Connection') {
        setSettings(await getCrmSettings(id))
      } else if (tab === 'Synchronization') {
        const result = await getCrmSynchronization(id)
        setErrors(result.items)
      } else if (tab === 'Field Mapping') {
        setMappings(await getCrmFieldMapping(id))
      } else if (tab === 'Activity') {
        setActivity(await getCrmIntegrationActivity(id))
      } else if (tab === 'Health') {
        setHealth(await getCrmHealth(id))
      }
    } catch (err) {
      showToast(err.message || 'Unable to load this tab.', 'error')
    } finally {
      setTabLoading(false)
    }
  }, [id, tab, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void loadItem(), 0)
    return () => window.clearTimeout(t)
  }, [loadItem])

  useEffect(() => {
    const t = window.setTimeout(() => void loadTab(), 0)
    return () => window.clearTimeout(t)
  }, [loadTab])

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

  const saveSettings = async () => {
    setSaving(true)
    try {
      const saved = await saveCrmSettings(id, settings)
      setSettings(saved)
      showToast('Settings updated.')
      await loadItem()
    } catch (err) {
      showToast(err.message || 'Unable to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const setField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
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
        description={`${item.environment} · Connected ${item.connectedDate || '—'}`.trim()}
        actions={<StatusBadge status={item.status} />}
      />

      <CrmReadOnlyBanner className="mb-4" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={syncing || item.status === 'DISCONNECTED'}
          onClick={async () => {
            setSyncing(true)
            try {
              await syncCrmNow(id)
              showToast('Sync completed successfully.')
              await loadItem()
              if (tab === 'Synchronization' || tab === 'Activity') await loadTab()
            } catch (err) {
              showToast(err.message || 'Sync failed.', 'error')
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

      {tabLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size={28} />
        </div>
      ) : tab === 'Connection' ? (
        <Card className="grid gap-4">
          <Select
            label="Environment"
            value={settings.environment}
            onChange={(e) => setField('environment', e.target.value)}
            options={(settings.options?.environments || []).map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            label="Sync Frequency"
            value={settings.syncFrequency}
            onChange={(e) => setField('syncFrequency', e.target.value)}
            options={(settings.options?.frequencies || []).map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => setField('timezone', e.target.value)}
            options={(settings.options?.timezones || []).map((value) => ({
              value,
              label: value,
            }))}
          />
          <Toggle
            label="Auto Sync"
            checked={settings.autoSync}
            onChange={(next) => setField('autoSync', next)}
          />
          <Toggle
            label="Lead Sync"
            checked={settings.leadSync}
            onChange={(next) => setField('leadSync', next)}
          />
          <Toggle
            label="Customer Sync"
            checked={settings.customerSync}
            onChange={(next) => setField('customerSync', next)}
          />
          <Toggle
            label="Appointment Sync"
            checked={settings.appointmentSync}
            onChange={(next) => setField('appointmentSync', next)}
          />
          <Toggle
            label="Sold Deal Sync"
            checked={settings.soldDealSync}
            onChange={(next) => setField('soldDealSync', next)}
          />
          <div>
            <Button onClick={() => void saveSettings()} disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size={16} />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Card>
      ) : tab === 'Synchronization' ? (
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
                  String(row.status).toUpperCase() === 'FAILED' ? (
                    <Button
                      size="sm"
                      disabled={retryingId === row.id}
                      onClick={async () => {
                        setRetryingId(row.id)
                        try {
                          await retryCrmSyncError(row.id)
                          showToast('Retry started.')
                          await loadTab()
                        } catch (err) {
                          showToast(err.message || 'Unable to retry sync error.', 'error')
                        } finally {
                          setRetryingId(null)
                        }
                      }}
                    >
                      {retryingId === row.id ? <LoadingSpinner size={14} /> : 'Retry'}
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
      ) : tab === 'Field Mapping' ? (
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
            rows={mappings}
            pageSize={10}
            emptyTitle="No field mappings yet."
          />
        </Card>
      ) : tab === 'Activity' ? (
        <Card>
          {activity.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No activity for this CRM.</p>
          ) : (
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
          )}
        </Card>
      ) : (
        <Card>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">Latency</dt>
              <dd className="text-lg font-semibold">{health?.latencyMs ?? 0} ms</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Uptime</dt>
              <dd className="text-lg font-semibold">{health?.uptime ?? 0}%</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Last Check</dt>
              <dd className="text-lg font-semibold">{health?.lastCheck || '—'}</dd>
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
