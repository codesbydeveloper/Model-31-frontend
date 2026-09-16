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
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { getNegotiationLimits } from '../../services/api/superAdminNegotiationControlService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

function money(value) {
  return `$${formatNumber(value)}`
}

export default function NegotiationControlPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [notice, setNotice] = useState(
    'Model 31 cannot negotiate outside manager-defined limits. If negotiation limits are not configured, price negotiation is unavailable.',
  )
  const [title, setTitle] = useState('Negotiation Control')
  const [description, setDescription] = useState(
    'Define the limits Model 31 may use when advanced deal assistance is enabled.',
  )
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getNegotiationLimits({
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setNotice(result.notice)
      setTitle(result.pageTitle)
      setDescription(result.description)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load negotiation control.', 'error')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, showToast])

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
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        {notice}
      </div>
      <Card>
        <div className="mb-4 max-w-md">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No negotiation limits configured."
          />
        )}
      </Card>
    </div>
  )
}
