import { Link } from 'react-router-dom'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import CrmReadOnlyBanner from '../leads/CrmReadOnlyBanner'
import { formatNumber } from '../../utils/table'

export default function CrmReadOnlySyncCard({ data }) {
  if (!data) return null
  return (
    <Card>
      <h2 className="text-base font-semibold">CRM Read-Only Sync</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Model 31 reads dealership CRM records. It does not write back.
      </p>
      <CrmReadOnlyBanner className="mt-4" />
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
