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
import customerIdentityService from '../../services/mock/customerIdentityService'

export default function CustomerIdentityPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await customerIdentityService.getCustomerIdentity())
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
    if (!q) return rows.filter((r) => r.status !== 'MERGED')
    return rows.filter(
      (r) =>
        r.status !== 'MERGED' &&
        (r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.leadIds.some((id) => id.toLowerCase().includes(q)) ||
          r.crmId.toLowerCase().includes(q)),
    )
  }, [rows, search])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Customer Identity"
        description="View unified customer profiles across conversations, CRM and marketing channels."
      />
      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, email, phone, lead ID, CRM ID..."
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              {
                key: 'leadIds',
                label: 'Lead ID',
                render: (row) => row.leadIds?.[0] || '—',
              },
              { key: 'crmId', label: 'CRM ID' },
              {
                key: 'channels',
                label: 'Channels',
                render: (row) => (row.channels || []).join(', '),
              },
              { key: 'dealership', label: 'Dealership' },
              { key: 'lastActivity', label: 'Last Activity' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/super-admin/customer-identity/${row.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={8}
            emptyTitle="No customers found."
          />
        )}
      </Card>
    </div>
  )
}
