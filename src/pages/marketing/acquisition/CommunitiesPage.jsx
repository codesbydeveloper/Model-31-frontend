import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { formatNumber } from '../../../utils/table'
import { COMMUNITY_STATUSES } from '../../../data/communities'
import communityService from '../../../services/mock/communityService'

export default function CommunitiesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await communityService.getCommunities())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.platform.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [rows, search, status])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Communities"
        description="Monitor dealership communities and acquisition activity."
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...COMMUNITY_STATUSES.map((s) => ({ value: s, label: s })),
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
              {
                key: 'name',
                label: 'Community',
                render: (row) => (
                  <Link
                    to={`/marketing/acquisition/communities/${row.id}`}
                    className="font-medium text-[var(--brand-accent)] hover:underline"
                  >
                    {row.name}
                  </Link>
                ),
              },
              { key: 'platform', label: 'Platform' },
              { key: 'location', label: 'Location' },
              {
                key: 'audience',
                label: 'Audience',
                render: (row) => formatNumber(row.audience),
              },
              {
                key: 'engagement',
                label: 'Engagement',
                render: (row) => formatNumber(row.engagement),
              },
              {
                key: 'leads',
                label: 'Leads',
                render: (row) => formatNumber(row.leads),
              },
              {
                key: 'qualifiedLeads',
                label: 'Qualified',
                render: (row) => formatNumber(row.qualifiedLeads),
              },
              {
                key: 'appointments',
                label: 'Appointments',
                render: (row) => formatNumber(row.appointments),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'lastActivity', label: 'Last Activity' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/marketing/acquisition/communities/${row.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            pageSize={8}
            onPageChange={setPage}
            emptyTitle="No communities found."
          />
        )}
      </Card>
    </div>
  )
}
