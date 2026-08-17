import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import dealHandoffService from '../../services/mock/dealHandoffService'
import { HANDOFF_STATUSES, HANDOFF_PRIORITIES } from '../../data/dealHandoffs'

export default function DealHandoffsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await dealHandoffService.getDealHandoffs())
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
    return rows.filter((row) => {
      if (status !== 'all' && row.dealStatus !== status) return false
      if (!q) return true
      return (
        row.customerName.toLowerCase().includes(q) ||
        row.vehicle.toLowerCase().includes(q) ||
        row.salesperson.toLowerCase().includes(q)
      )
    })
  }, [rows, search, status])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Deal Handoffs"
        description="Review qualified buyers and structured deals requiring management attention."
      />
      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search customer, vehicle, salesperson..."
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...HANDOFF_STATUSES.map((item) => ({ value: item, label: item })),
            ]}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'score', label: 'Lead Score' },
              {
                key: 'intent',
                label: 'Intent',
                render: (row) => <StatusBadge status={row.intent} />,
              },
              {
                key: 'nuclearMode',
                label: 'Nuclear Mode',
                render: (row) => <StatusBadge status={row.nuclearMode} />,
              },
              {
                key: 'dealStatus',
                label: 'Deal Status',
                render: (row) => <StatusBadge status={row.dealStatus} />,
              },
              { key: 'salesperson', label: 'Salesperson' },
              { key: 'handoffTime', label: 'Handoff Time' },
              {
                key: 'priority',
                label: 'Priority',
                render: (row) => <StatusBadge status={row.priority} />,
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <Link to={`/super-admin/deal-handoffs/${row.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={8}
            emptyTitle="No handoffs match these filters."
          />
        )}
      </Card>
      <p className="mt-3 hidden text-xs text-[var(--text-muted)]">
        {HANDOFF_PRIORITIES.join(' · ')}
      </p>
    </div>
  )
}
