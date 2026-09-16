import { Link } from 'react-router-dom'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import { formatNumber } from '../../utils/table'

export default function CrmReadOnlySyncCard({ data }) {
  if (!data) return null
  const info = data.info || {}
  return (
    <Card>
      <h2 className="text-base font-semibold">{data.title || 'CRM Read-Only Sync'}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {data.description || 'Model 31 reads dealership CRM records. It does not write back.'}
      </p>
      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3">
        <p className="text-sm font-semibold">CRM Mode: {info.crmMode || data.mode || 'READ ONLY'}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Pipeline: {info.pipeline || 'DEALERSHIP'} · Source: {info.source || 'CRM'} · Model 31 Access:{' '}
          {info.model31Access || 'READ ONLY'}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {info.note || 'Model 31 does not modify dealership leads.'}
        </p>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">CRM Status</dt>
          <dd>
            <StatusBadge status={data.status} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Mode</dt>
          <dd className="font-semibold">{data.mode}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Last Sync</dt>
          <dd className="font-medium">{data.lastSync}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Records Read</dt>
          <dd className="font-medium">{formatNumber(data.recordsRead)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">New Updates</dt>
          <dd className="font-medium">{formatNumber(data.newUpdates)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Errors</dt>
          <dd className="font-medium">{formatNumber(data.errors)}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <Link to="/super-admin/crm-integrations">
          <Button variant="secondary" size="sm">
            View CRM Activity
          </Button>
        </Link>
      </div>
    </Card>
  )
}
