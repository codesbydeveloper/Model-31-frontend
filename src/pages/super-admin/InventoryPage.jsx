import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import {
  EMPTY_INVENTORY,
  getInventory,
} from '../../services/api/superAdminInventoryService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

export default function InventoryPage() {
  const { showToast } = useToast()
  const [metrics, setMetrics] = useState(EMPTY_INVENTORY.metrics)
  const [insights, setInsights] = useState([])
  const [filters, setFilters] = useState(EMPTY_INVENTORY.filters)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dealership, setDealership] = useState('')
  const [make, setMake] = useState('')
  const [price, setPrice] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getInventory({
        search: debouncedSearch,
        status,
        dealership,
        make,
        price,
        page,
        limit: PAGE_SIZE,
      })
      setMetrics(result.metrics)
      setInsights(result.insights)
      setFilters(result.filters)
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setMetrics(EMPTY_INVENTORY.metrics)
      setInsights([])
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load inventory.', 'error')
    } finally {
      setInitialized(true)
      setLoading(false)
    }
  }, [debouncedSearch, status, dealership, make, price, page, showToast])

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

  const onFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  if (loading && !initialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Inventory Intelligence"
        description="Monitor vehicle inventory, pricing, availability and dealership inventory signals."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Total Vehicles" value={formatNumber(metrics.totalVehicles)} />
        <StatCard label="Available" value={formatNumber(metrics.available)} />
        <StatCard label="Reserved" value={formatNumber(metrics.reserved)} />
        <StatCard label="Sold" value={formatNumber(metrics.sold)} />
        <StatCard label="Low Inventory" value={formatNumber(metrics.lowInventory)} />
        <StatCard label="Price Changes" value={formatNumber(metrics.priceChanges)} />
      </div>

      {insights.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {insights.map((sig) => (
            <Card key={sig.id}>
              <StatusBadge status={sig.severity} />
              <p className="mt-2 font-semibold">{sig.type}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{sig.detail}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VIN, make, model."
          />
          <Select value={status} onChange={onFilterChange(setStatus)} options={filters.statuses} />
          <Select
            value={dealership}
            onChange={onFilterChange(setDealership)}
            options={filters.dealerships}
          />
          <Select value={make} onChange={onFilterChange(setMake)} options={filters.makes} />
          <Select value={price} onChange={onFilterChange(setPrice)} options={filters.prices} />
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
              { key: 'year', label: 'Year' },
              { key: 'make', label: 'Make' },
              { key: 'model', label: 'Model' },
              { key: 'trim', label: 'Trim' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => `$${formatNumber(row.price)}`,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'dealership', label: 'Dealership' },
              { key: 'daysInInventory', label: 'Days in Inventory' },
              { key: 'lastUpdated', label: 'Last Updated' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/super-admin/inventory/${row.id}`}>
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
            emptyTitle="No vehicles found."
          />
        )}
      </Card>
    </div>
  )
}
