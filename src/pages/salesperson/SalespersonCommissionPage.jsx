import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import Modal from '../../components/common/Modal'
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import commissionService from '../../services/mock/commissionService'

const RANGE_OPTIONS = [
  { value: 'current', label: 'Current Month' },
  { value: 'previous', label: 'Previous Month' },
  { value: 'last3', label: 'Last 3 Months' },
  { value: 'year', label: 'This Year' },
]

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
  const [range, setRange] = useState('current')
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusBusy, setStatusBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, list] = await Promise.all([
        commissionService.getCommissionSummary('sp_001', range),
        commissionService.getCommissionRecords('sp_001', range),
      ])
      setSummary(s)
      setRows(list)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const nextStatus = useMemo(() => {
    if (!statusTarget) return null
    if (statusTarget.status === 'PENDING') return 'APPROVED'
    if (statusTarget.status === 'APPROVED') return 'PAID'
    return null
  }, [statusTarget])

  const applyStatus = async () => {
    if (!statusTarget || !nextStatus) return
    setStatusBusy(true)
    try {
      await commissionService.updateCommissionStatus(statusTarget.id, nextStatus)
      showToast(
        nextStatus === 'APPROVED'
          ? 'Commission approved.'
          : 'Commission marked as paid.',
      )
      setStatusTarget(null)
      await load()
    } finally {
      setStatusBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Commission"
        description="Track sold deals, commission earnings and payout status."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={RANGE_OPTIONS}
              className="w-44"
            />
            <Button
              variant="secondary"
              onClick={() => {
                exportCsv(rows)
                showToast('Commission CSV exported.')
              }}
            >
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        }
      />

      {loading || !summary ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Current Month Sales" value={formatNumber(summary.currentMonthSales)} />
            <StatCard
              label="Current Month Commission"
              value={money(summary.currentMonthCommission)}
            />
            <StatCard label="Pending Commission" value={money(summary.pendingCommission)} />
            <StatCard label="Paid Commission" value={money(summary.paidCommission)} />
            <StatCard label="Average Deal Value" value={money(summary.averageDealValue)} />
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
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(row)}>
                        View
                      </Button>
                      {row.status === 'PENDING' && (
                        <Button size="sm" onClick={() => setStatusTarget(row)}>
                          Approve
                        </Button>
                      )}
                      {row.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => setStatusTarget(row)}>
                          Mark Paid
                        </Button>
                      )}
                    </div>
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

      <ConfirmModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={applyStatus}
        title={nextStatus === 'APPROVED' ? 'Approve commission?' : 'Mark paid?'}
        message={
          nextStatus === 'APPROVED'
            ? 'Approve this pending commission?'
            : 'Mark this commission as paid?'
        }
        confirmLabel={nextStatus === 'APPROVED' ? 'Approve' : 'Mark Paid'}
        loading={statusBusy}
      />

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
      <span className="font-medium">{value}</span>
    </div>
  )
}
