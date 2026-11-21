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
import Modal from '../../components/common/Modal'
import InventoryVehicleFields, {
  EMPTY_VEHICLE_FORM,
  vehicleFormError,
  vehicleFormFromRow,
} from '../../components/inventory/InventoryVehicleFields'
import ConfirmModal from '../../components/common/ConfirmModal'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { getDealershipOptions } from '../../services/api/dealershipService'
import {
  EMPTY_INVENTORY,
  getInventory,
  createInventoryVehicle,
  updateInventoryVehicle,
  deleteInventoryVehicle,
} from '../../services/api/superAdminInventoryService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

export default function InventoryPage() {
  const { showToast } = useToast()
  const [metrics, setMetrics] = useState(EMPTY_INVENTORY.metrics)
  const [insights, setInsights] = useState([])
  const [filters, setFilters] = useState(EMPTY_INVENTORY.filters)
  const [dealershipChoices, setDealershipChoices] = useState([])
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
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_VEHICLE_FORM)
  const [editOpen, setEditOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState(EMPTY_VEHICLE_FORM)

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

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const options = await getDealershipOptions()
        setDealershipChoices(
          options.map((item) => ({ value: item.label, label: item.label })),
        )
      } catch (err) {
        setDealershipChoices([])
        showToast(err.message || 'Unable to load dealerships.', 'error')
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [showToast])

  const onFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setEditForm(vehicleFormFromRow(row))
    setEditOpen(true)
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    const message = vehicleFormError(editForm)
    if (message) {
      showToast(message, 'error')
      return
    }
    setSaving(true)
    try {
      await updateInventoryVehicle(editingId, editForm)
      setEditOpen(false)
      setEditingId('')
      showToast('Vehicle updated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteVehicle = (id) => {
    setConfirm({ type: 'vehicle', id: id || editingId })
  }

  const confirmDelete = async () => {
    if (!confirm) return
    setSaving(true)
    try {
      await deleteInventoryVehicle(confirm.id)
      setEditOpen(false)
      setEditingId('')
      showToast('Vehicle deleted.')
      await load()
      setConfirm(null)
    } catch (err) {
      showToast(err.message || 'Unable to delete the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveVehicle = async (event) => {
    event.preventDefault()
    const message = vehicleFormError(form)
    if (message) {
      showToast(message, 'error')
      return
    }
    setSaving(true)
    try {
      await createInventoryVehicle(form)
      setAddOpen(false)
      setForm(EMPTY_VEHICLE_FORM)
      showToast('Vehicle added.')
      if (page !== 1) setPage(1)
      else await load()
    } catch (err) {
      showToast(err.message || 'Unable to add the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
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
        actions={<Button onClick={() => setAddOpen(true)}>Add Inventory</Button>}
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
              {
                key: 'srNo',
                label: 'Sr No',
                className: 'text-center',
                cellClassName: 'text-center',
              },
              {
                key: 'vin',
                label: 'VIN',
                className: 'text-center',
                cellClassName: 'text-center',
                render: (row) => row.vin || '—',
              },
              { key: 'year', label: 'Year', render: (row) => row.year || '—' },
              { key: 'make', label: 'Make', render: (row) => row.make || '—' },
              { key: 'model', label: 'Model', render: (row) => row.model || '—' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => `$${formatNumber(row.price)}`,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" disabled={saving} onClick={() => deleteVehicle(row.id)}>
                      Delete
                    </Button>
                    <Link to={`/super-admin/inventory/${row.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={rows.map((row, index) => ({
              ...row,
              srNo: (page - 1) * PAGE_SIZE + index + 1,
            }))}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No vehicles found."
          />
        )}
      </Card>

      <Modal open={addOpen} onClose={() => !saving && setAddOpen(false)} title="Add Inventory">
        <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={saveVehicle}>
          <InventoryVehicleFields values={form} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add Inventory'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => !saving && !confirm && setEditOpen(false)} title="Edit Inventory">
        <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={saveEdit}>
          <InventoryVehicleFields values={editForm} onChange={(key, value) => setEditForm((current) => ({ ...current, [key]: value }))} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={() => deleteVehicle(editingId)}>
              Delete vehicle
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => !saving && setConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete vehicle"
        message="This removes the vehicle from inventory."
        confirmLabel="Delete"
        danger
        loading={saving && Boolean(confirm)}
      />
    </div>
  )
}
