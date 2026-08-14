import { useCallback, useEffect, useMemo, useState } from 'react'
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
import inventoryService from '../../services/mock/inventoryService'
import { INVENTORY_STATUSES } from '../../data/inventory'
import { DEALERSHIPS } from '../../data/marketingContent'

export default function InventoryPage() {
  const [stats, setStats] = useState(null)
  const [signals, setSignals] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dealership, setDealership] = useState('all')
  const [make, setMake] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, sig, list] = await Promise.all([
        inventoryService.getInventoryStats(),
        inventoryService.getInventorySignals(),
        inventoryService.getInventory(),
      ])
      setStats(s)
      setSignals(sig)
      setRows(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const makes = useMemo(() => [...new Set(rows.map((r) => r.make))].sort(), [rows])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.vin.toLowerCase().includes(q) ||
          r.make.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.dealership.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (dealership !== 'all') list = list.filter((r) => r.dealership === dealership)
    if (make !== 'all') list = list.filter((r) => r.make === make)
    if (priceRange === 'under50') list = list.filter((r) => r.price < 50000)
    if (priceRange === '50to70') list = list.filter((r) => r.price >= 50000 && r.price <= 70000)
    if (priceRange === 'over70') list = list.filter((r) => r.price > 70000)
    return list
  }, [rows, search, status, dealership, make, priceRange])

  if (loading || !stats) {
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
        <StatCard label="Total Vehicles" value={formatNumber(stats.totalVehicles)} />
        <StatCard label="Available" value={formatNumber(stats.available)} />
        <StatCard label="Reserved" value={formatNumber(stats.reserved)} />
        <StatCard label="Sold" value={formatNumber(stats.sold)} />
        <StatCard label="Low Inventory" value={formatNumber(stats.lowInventory)} />
        <StatCard label="Price Changes" value={formatNumber(stats.priceChanges)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {signals.map((sig) => (
          <Card key={sig.id}>
            <StatusBadge status={sig.severity} />
            <p className="mt-2 font-semibold">{sig.type}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{sig.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search VIN, make, model, dealership..."
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...INVENTORY_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={dealership}
            onChange={(e) => setDealership(e.target.value)}
            options={[
              { value: 'all', label: 'All dealerships' },
              ...DEALERSHIPS.map((d) => ({ value: d, label: d })),
            ]}
          />
          <Select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            options={[
              { value: 'all', label: 'All makes' },
              ...makes.map((m) => ({ value: m, label: m })),
            ]}
          />
          <Select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            options={[
              { value: 'all', label: 'All prices' },
              { value: 'under50', label: 'Under $50,000' },
              { value: '50to70', label: '$50,000 – $70,000' },
              { value: 'over70', label: 'Over $70,000' },
            ]}
          />
        </div>
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
          rows={filtered}
          page={page}
          onPageChange={setPage}
          pageSize={8}
          emptyTitle="No vehicles found."
        />
      </Card>
    </div>
  )
}
