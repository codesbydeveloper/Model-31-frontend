import DataTable from '../common/DataTable'
import StatusBadge from '../common/StatusBadge'
import { formatNumber } from '../../utils/table'

export default function OEMSummaryTable({ rows }) {
  return (
    <DataTable
      columns={[
        {
          key: 'brand',
          label: 'Brand',
          render: (row) => (
            <div>
              <p className="font-medium">{row.brand}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {(row.stores || []).join(', ')}
              </p>
            </div>
          ),
        },
        {
          key: 'optIns',
          label: 'Opt-Ins',
          render: (row) => formatNumber(row.optIns),
        },
        {
          key: 'salesInfluenced',
          label: 'Sales Influenced',
          render: (row) => formatNumber(row.salesInfluenced),
        },
        {
          key: 'attribution',
          label: 'Attribution',
          render: (row) => `${row.attribution}%`,
        },
        {
          key: 'compliance',
          label: 'Compliance',
          render: (row) => <StatusBadge status={row.compliance} />,
        },
      ]}
      rows={rows}
      pageSize={rows.length || 1}
      emptyTitle="No OEM brands match this filter."
      emptyDescription="Try selecting All Brands to view the full OEM report."
    />
  )
}
