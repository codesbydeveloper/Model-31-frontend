import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import { getSalespersonCommission } from '../../services/api/salespersonCommissionService'

function money(value) {
  return `$${formatNumber(value)}`
}

function exportCsv(rows) {
  const headers = [
    'Deal',
    'Customer',
    'Vehicle',
    'Deal Amount',
    'Rate',
    'Base',
    'Bonus',
    'Total',
    'Status',
    'Date',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.dealId,
        `"${r.customerName}"`,
        `"${r.vehicle}"`,
        r.dealAmount,
        r.commissionRate,
        r.baseCommission,
        r.bonus,
        r.totalCommission,
        r.status,
        r.saleDate,
      ].join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'commission-history.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function SalespersonCommissionPage() {
  const { showToast } = useToast()
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSalespersonCommission()
      setSummary(data.summary)
      setRows(data.records)
    } catch (err) {
      setSummary(null)
      setRows([])
      showToast(err.message || 'Unable to load commission.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-7xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Commission"
        description="Track sold deals, commission earnings and payout status."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              exportCsv(rows)
              showToast('Commission CSV exported.')
            }}
            disabled={!rows.length}
          >
            <Download size={16} />
            Export CSV
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Current Month Sales" value={formatNumber(summary?.currentMonthSales || 0)} />
            <StatCard
              label="Current Month Commission"
              value={money(summary?.currentMonthCommission || 0)}
            />
            <StatCard label="Pending Commission" value={money(summary?.pendingCommission || 0)} />
            <StatCard label="Paid Commission" value={money(summary?.paidCommission || 0)} />
            <StatCard label="Average Deal Value" value={money(summary?.averageDealValue || 0)} />
          </div>

          <Card className="mt-5">
            <h2 className="mb-4 text-base font-semibold">Commission History</h2>
            <DataTable
              columns={[
                { key: 'dealId', label: 'Deal' },
                { key: 'customerName', label: 'Customer' },
                { key: 'vehicle', label: 'Vehicle' },
                {
                  key: 'dealAmount',
                  label: 'Deal Amount',
                  render: (row) => money(row.dealAmount),
                },
                {
                  key: 'commissionRate',
                  label: 'Commission Rate',
                  render: (row) => `${(row.commissionRate * 100).toFixed(1)}%`,
                },
                {
                  key: 'baseCommission',
                  label: 'Base Commission',
                  render: (row) => money(row.baseCommission),
                },
                {
                  key: 'bonus',
                  label: 'Bonus',
                  render: (row) => money(row.bonus),
                },
                {
                  key: 'totalCommission',
                  label: 'Total Commission',
                  render: (row) => (
                    <span className="font-semibold">{money(row.totalCommission)}</span>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (row) => <StatusBadge status={row.status} />,
                },
                { key: 'saleDate', label: 'Date' },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (row) => (
                    <Button size="sm" variant="ghost" onClick={() => setDetail(row)}>
                      View
                    </Button>
                  ),
                },
              ]}
              rows={rows}
              pageSize={8}
              emptyTitle="No commission records."
            />
          </Card>
        </>
      )}

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Commission Details"
        className="max-w-lg"
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <Info label="Customer" value={detail.customerName} />
            <Info label="Vehicle" value={detail.vehicle} />
            <Info label="Dealership" value={detail.dealership} />
            <Info label="Sale Date" value={detail.saleDate} />
            <Info label="Payout Status" value={detail.status} />
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-4">
              <p className="font-semibold">Calculation</p>
              <p className="mt-2">Deal Amount {money(detail.dealAmount)}</p>
              <p>× {(detail.commissionRate * 100).toFixed(1)}%</p>
              <p className="mt-2">Base Commission {money(detail.baseCommission)}</p>
              <p>Bonus {money(detail.bonus)}</p>
              <p className="mt-2 text-base font-semibold">
                Total Commission {money(detail.totalCommission)}
              </p>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-4">
        <Link to="/salesperson/sold-deals">
          <Button variant="secondary">View Sold Deals</Button>
        </Link>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  )
}
