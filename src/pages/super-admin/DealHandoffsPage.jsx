import { useCallback, useEffect, useState } from 'react'
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
import { useToast } from '../../hooks/useToast'
import {
  EMPTY_HANDOFF_PAGE,
  getDealHandoffs,
} from '../../services/api/superAdminDealHandoffService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

export default function DealHandoffsPage() {
  const { showToast } = useToast()
  const [title, setTitle] = useState(EMPTY_HANDOFF_PAGE.pageTitle)
  const [description, setDescription] = useState(EMPTY_HANDOFF_PAGE.description)
  const [statusOptions, setStatusOptions] = useState(EMPTY_HANDOFF_PAGE.options.statuses)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getDealHandoffs({
        search: debouncedSearch,
        status,
        page,
        limit: PAGE_SIZE,
      })
      setTitle(result.pageTitle)
      setDescription(result.description)
      setStatusOptions(result.options.statuses)
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load deal handoffs.', 'error')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page, showToast])

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
      <PageHeader title={title} description={description} />
      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, vehicle, salesperson..."
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={statusOptions}
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
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No handoffs match these filters."
          />
        )}
      </Card>
    </div>
  )
}
