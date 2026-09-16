import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { getCustomerIdentities } from '../../services/api/superAdminCustomerIdentityService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

export default function CustomerIdentityPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCustomerIdentities({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load customer identity.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

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
            onChange={(e) => setSearch(e.target.value)}
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
                render: (row) => (row.channels || []).join(', ') || '—',
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
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No customers found."
          />
        )}
      </Card>
    </div>
  )
}
