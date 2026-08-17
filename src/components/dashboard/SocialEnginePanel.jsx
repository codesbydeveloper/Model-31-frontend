import Card from '../common/Card'
import DataTable from '../common/DataTable'
import PlatformBadge from '../marketing/PlatformBadge'
import { formatNumber } from '../../utils/table'
import StaffDealerFlow from '../leads/StaffDealerFlow'

export default function SocialEnginePanel({ rows = [] }) {
  return (
    <Card>
      <h2 className="text-base font-semibold">Social Engine</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Content performance by platform. Visualization only.
      </p>
      <div className="mt-4">
        <DataTable
          columns={[
            {
              key: 'platform',
              label: 'Platform',
              render: (row) => <PlatformBadge platform={row.platform} />,
            },
            { key: 'content', label: 'Content/Source' },
            { key: 'engagement', label: 'Engagement' },
            {
              key: 'leads',
              label: 'Leads',
              render: (row) => formatNumber(row.leads),
            },
            {
              key: 'qualified',
              label: 'Qualified',
              render: (row) => formatNumber(row.qualified),
            },
            {
              key: 'sold',
              label: 'Sold',
              render: (row) => formatNumber(row.sold),
            },
          ]}
          rows={rows}
          pageSize={6}
          emptyTitle="No social performance data."
        />
      </div>
      <div className="mt-5">
        <StaffDealerFlow showTransfer />
      </div>
    </Card>
  )
}
