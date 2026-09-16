import Card from '../common/Card'
import DataTable from '../common/DataTable'
import PlatformBadge from '../marketing/PlatformBadge'
import { formatNumber, formatPercent } from '../../utils/table'
import StaffDealerFlow from '../leads/StaffDealerFlow'

export default function SocialEnginePanel({ rows = [], workflow, subtitle }) {
  const showCounts = rows.some(
    (row) => row.leads != null || row.qualified != null || row.sold != null,
  )

  return (
    <Card className="flex h-full flex-col">
      <h2 className="text-base font-semibold">Social Engine</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {subtitle || 'Content performance by platform. Visualization only.'}
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
            {
              key: 'engagement',
              label: 'Engagement',
              render: (row) =>
                typeof row.engagement === 'number'
                  ? formatPercent(row.engagement)
                  : row.engagement,
            },
            ...(showCounts
              ? [
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
                ]
              : []),
          ]}
          rows={rows}
          pageSize={6}
          emptyTitle="No social performance data."
        />
      </div>
      <div className="mt-auto pt-5">
        <StaffDealerFlow
          showTransfer
          title={workflow?.title}
          source={workflow?.source}
          status={workflow?.status}
          steps={workflow?.steps}
        />
      </div>
    </Card>
  )
}
