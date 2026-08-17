import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import negotiationService from '../../services/mock/negotiationService'

function money(value) {
  return `$${formatNumber(value)}`
}

export default function NegotiationControlPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await negotiationService.getNegotiationLimits())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        row.vin.toLowerCase().includes(q) ||
        row.vehicle.toLowerCase().includes(q) ||
        row.template.toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Negotiation Control"
        description="Define the limits Model 31 may use when advanced deal assistance is enabled."
      />
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Model 31 cannot negotiate outside manager-defined limits. If negotiation
        limits are not configured, price negotiation is unavailable.
      </div>
      <Card>
        <div className="mb-4 max-w-md">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search VIN, vehicle, template..."
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'vin', label: 'VIN' },
              { key: 'vehicle', label: 'Vehicle' },
              {
                key: 'minPrice',
                label: 'Minimum Price',
                render: (row) => money(row.minPrice),
              },
              {
                key: 'maxDiscount',
                label: 'Maximum Discount',
                render: (row) => money(row.maxDiscount),
              },
              {
                key: 'payment',
                label: 'Payment',
                render: (row) => `${money(row.paymentMin)}–${money(row.paymentMax)}`,
              },
              {
                key: 'trade',
                label: 'Trade',
                render: (row) => `${money(row.tradeMin)}–${money(row.tradeMax)}`,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'template', label: 'Template' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/super-admin/negotiation-control/${row.id}`}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                    <Link to={`/super-admin/negotiation-control/${row.id}?edit=1`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={8}
            emptyTitle="No negotiation limits configured."
          />
        )}
      </Card>
    </div>
  )
}
