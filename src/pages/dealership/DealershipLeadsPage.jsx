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
import EmptyState from '../../components/ui/EmptyState'
import { formatNumber } from '../../utils/table'
import leadService from '../../services/mock/leadService'

export default function DealershipLeadsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await leadService.getLeads()
      setRows(all.filter((l) => l.dealership === 'Miami Luxury Motors'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.vehicle.toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealership Leads"
        description="Monitor and manage leads for Miami Luxury Motors."
      />
      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Qualified and incoming leads for this dealership will appear here."
          />
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'Lead ID' },
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'score', label: 'Score' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'salesperson',
                label: 'Salesperson',
                render: (row) => row.salesperson || 'Unassigned',
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/dealership/conversations?lead=${row.id}`}>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </Link>
                ),
              },
            ]}
            rows={filtered}
            pageSize={8}
          />
        )}
      </Card>
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Showing {formatNumber(filtered.length)} dealership leads (mock).
      </p>
    </div>
  )
}
