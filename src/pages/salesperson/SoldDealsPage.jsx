import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatNumber } from '../../utils/table'
import { getSoldDeals } from '../../services/mock/soldDealService'
import commissionService from '../../services/mock/commissionService'

function money(value) {
  return `$${formatNumber(value)}`
}

export default function SoldDealsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [commissions, setCommissions] = useState([])
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [deals, comms] = await Promise.all([
        getSoldDeals('sp_001'),
        commissionService.getCommissionRecords('sp_001', 'year'),
      ])
      setRows(deals)
      setCommissions(comms)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const withCommission = rows.map((deal) => {
    const comm = commissions.find((c) => c.dealId === deal.id)
    return {
      ...deal,
      commission: comm?.totalCommission || 0,
      commissionStatus: comm?.status || 'PENDING',
      commissionRecord: comm,
    }
  })

  return (
    <div className="mx-auto w-full max-w-7xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Sold Deals"
        description="Closed deals and associated commission records."
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              {
                key: 'salePrice',
                label: 'Deal Amount',
                render: (row) => money(row.salePrice),
              },
              { key: 'saleDate', label: 'Sale Date' },
              {
                key: 'commission',
                label: 'Commission',
                render: (row) => money(row.commission),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.commissionStatus} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetail(row)}>
                      View Deal
                    </Button>
                    {row.leadId && (
                      <Link to={`/salesperson/leads/${row.leadId}`}>
                        <Button size="sm" variant="ghost">
                          View Lead
                        </Button>
                      </Link>
                    )}
                    <Link to="/salesperson/commission">
                      <Button size="sm" variant="ghost">
                        View Commission
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={withCommission}
            pageSize={10}
            emptyTitle="No sold deals yet."
          />
        )}
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Sold Deal"
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{detail.customerName}</strong>
            </p>
            <p>{detail.vehicle}</p>
            <p>{detail.dealership}</p>
            <p>Sale date: {detail.saleDate}</p>
            <p>Deal amount: {money(detail.salePrice)}</p>
            <p>Commission: {money(detail.commission)}</p>
            {detail.notes && <p className="text-[var(--text-secondary)]">{detail.notes}</p>}
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
