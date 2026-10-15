import { useCallback, useEffect, useRef, useState } from 'react'
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
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { INVENTORY_STATUSES } from '../../data/inventory'
import { getDealershipOptions } from '../../services/api/dealershipService'
import {
  EMPTY_INVENTORY,
  getInventory,
  createInventoryVehicle,
  updateInventoryVehicle,
  deleteInventoryImage,
  deleteInventoryVehicle,
} from '../../services/api/superAdminInventoryService'

const EMPTY_ADD_FORM = {
  make: '',
  model: '',
  year: '',
  trim: '',
  vin: '',
  price: '',
  status: 'AVAILABLE',
  dealership: '',
}

const STATUS_FOR_FORM = {
  LIVE: 'AVAILABLE',
  AVAILABLE: 'AVAILABLE',
  PROCESSED: 'RESERVED',
  RESERVED: 'RESERVED',
  NEEDS_PHOTOS: 'PENDING',
  PENDING: 'PENDING',
  SOLD: 'SOLD',
}

function cleanField(value) {
  const text = value == null ? '' : String(value).trim()
  return text === '—' ? '' : text
}

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

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
  const [form, setForm] = useState(EMPTY_ADD_FORM)
  const [images, setImages] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState(EMPTY_ADD_FORM)
  const [editImages, setEditImages] = useState([])
  const [savedImages, setSavedImages] = useState([])
  const fileInputRef = useRef(null)
  const editFileRef = useRef(null)

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

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const clearImages = () => {
    setImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview))
      return []
    })
  }

  const onPickImages = (event) => {
    const picked = Array.from(event.target.files || [])
    event.target.value = ''
    if (!picked.length) return

    const accepted = []
    for (const file of picked) {
      if (!String(file.type || '').startsWith('image/')) {
        showToast('Choose image files only.', 'error')
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        showToast('Each image must be 5 MB or smaller.', 'error')
        continue
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(16).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    }

    setImages((current) => {
      const room = MAX_IMAGES - current.length
      if (room <= 0) {
        accepted.forEach((item) => URL.revokeObjectURL(item.preview))
        showToast('You can upload up to 10 images.', 'error')
        return current
      }
      if (accepted.length > room) {
        accepted.slice(room).forEach((item) => URL.revokeObjectURL(item.preview))
        showToast('You can upload up to 10 images.', 'error')
      }
      return [...current, ...accepted.slice(0, room)]
    })
  }

  const removeImage = (id) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return current.filter((item) => item.id !== id)
    })
  }

  const clearEditImages = () => {
    setEditImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview))
      return []
    })
  }

  const onPickEditImages = (event) => {
    const picked = Array.from(event.target.files || [])
    event.target.value = ''
    if (!picked.length) return

    const accepted = []
    for (const file of picked) {
      if (!String(file.type || '').startsWith('image/')) {
        showToast('Choose image files only.', 'error')
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        showToast('Each image must be 5 MB or smaller.', 'error')
        continue
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(16).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    }

    setEditImages((current) => {
      const room = MAX_IMAGES - current.length
      if (room <= 0) {
        accepted.forEach((item) => URL.revokeObjectURL(item.preview))
        showToast('You can upload up to 10 images.', 'error')
        return current
      }
      if (accepted.length > room) {
        accepted.slice(room).forEach((item) => URL.revokeObjectURL(item.preview))
        showToast('You can upload up to 10 images.', 'error')
      }
      return [...current, ...accepted.slice(0, room)]
    })
  }

  const removeEditImage = (id) => {
    setEditImages((current) => {
      const target = current.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return current.filter((item) => item.id !== id)
    })
  }

  const openEdit = (row) => {
    clearEditImages()
    setEditingId(row.id)
    setSavedImages(row.images || [])
    setEditForm({
      make: cleanField(row.make),
      model: cleanField(row.model),
      year: cleanField(row.year),
      trim: cleanField(row.trim),
      vin: cleanField(row.vin),
      price: row.price == null ? '' : String(row.price),
      status: STATUS_FOR_FORM[String(row.status || '').toUpperCase()] || 'AVAILABLE',
      dealership: cleanField(row.dealership),
    })
    setEditOpen(true)
  }

  const setEditField = (key) => (event) => {
    setEditForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    if (!editForm.make.trim() || !editForm.model.trim()) {
      showToast('Make and model are required.', 'error')
      return
    }
    if (!editForm.dealership.trim()) {
      showToast('Dealership is required.', 'error')
      return
    }
    setSaving(true)
    try {
      await updateInventoryVehicle(editingId, {
        ...editForm,
        images: editImages.map((item) => item.file),
      })
      setEditOpen(false)
      setEditingId('')
      clearEditImages()
      showToast('Vehicle updated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteSavedImage = (imageId) => {
    setConfirm({ type: 'image', imageId })
  }

  const deleteVehicle = (id) => {
    setConfirm({ type: 'vehicle', id: id || editingId })
  }

  const confirmDelete = async () => {
    if (!confirm) return
    setSaving(true)
    try {
      if (confirm.type === 'image') {
        await deleteInventoryImage(editingId, confirm.imageId)
        setSavedImages((current) => current.filter((item) => item.id !== confirm.imageId))
        showToast('Image deleted.')
      } else {
        await deleteInventoryVehicle(confirm.id)
        setEditOpen(false)
        setEditingId('')
        showToast('Vehicle deleted.')
        await load()
      }
      setConfirm(null)
    } catch (err) {
      showToast(
        err.message || (confirm.type === 'image' ? 'Unable to delete the image.' : 'Unable to delete the vehicle.'),
        'error',
      )
    } finally {
      setSaving(false)
    }
  }

  const saveVehicle = async (event) => {
    event.preventDefault()
    if (!form.make.trim() || !form.model.trim()) {
      showToast('Make and model are required.', 'error')
      return
    }
    if (!form.dealership.trim()) {
      showToast('Dealership is required.', 'error')
      return
    }
    setSaving(true)
    try {
      await createInventoryVehicle({ ...form, images: images.map((item) => item.file) })
      setAddOpen(false)
      setForm(EMPTY_ADD_FORM)
      clearImages()
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

      <Modal open={addOpen} onClose={() => !saving && setAddOpen(false)} title="Add Inventory">
        <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={saveVehicle}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Make" value={form.make} onChange={setField('make')} />
            <Input label="Model" value={form.model} onChange={setField('model')} />
            <Input label="Year" value={form.year} onChange={setField('year')} inputMode="numeric" />
            <Input label="Trim" value={form.trim} onChange={setField('trim')} />
            <Input label="VIN" value={form.vin} onChange={setField('vin')} />
            <Input label="Price" value={form.price} onChange={setField('price')} inputMode="decimal" />
            <Select
              label="Dealership"
              value={form.dealership}
              onChange={setField('dealership')}
              placeholder="Select dealership"
              options={dealershipChoices}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={setField('status')}
              options={INVENTORY_STATUSES.map((item) => ({ value: item, label: item }))}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Images</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onPickImages}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              disabled={saving || images.length >= MAX_IMAGES}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from computer
            </Button>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((item) => (
                  <div key={item.id} className="grid gap-1">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="h-20 w-full rounded-[var(--radius-md)] object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => removeImage(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Make" value={editForm.make} onChange={setEditField('make')} />
            <Input label="Model" value={editForm.model} onChange={setEditField('model')} />
            <Input label="Year" value={editForm.year} onChange={setEditField('year')} inputMode="numeric" />
            <Input label="Trim" value={editForm.trim} onChange={setEditField('trim')} />
            <Input label="VIN" value={editForm.vin} onChange={setEditField('vin')} />
            <Input label="Price" value={editForm.price} onChange={setEditField('price')} inputMode="decimal" />
            <Select
              label="Dealership"
              value={editForm.dealership}
              onChange={setEditField('dealership')}
              placeholder="Select dealership"
              options={dealershipChoices}
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={setEditField('status')}
              options={INVENTORY_STATUSES.map((item) => ({ value: item, label: item }))}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Images</p>
            {savedImages.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No images yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {savedImages.map((image) => (
                  <div key={image.id} className="grid gap-1">
                    <img
                      src={image.url}
                      alt=""
                      className="h-20 w-full rounded-[var(--radius-md)] object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => deleteSavedImage(image.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-medium">Add images</p>
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onPickEditImages}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              disabled={saving || editImages.length >= MAX_IMAGES}
              onClick={() => editFileRef.current?.click()}
            >
              Upload from computer
            </Button>
            {editImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {editImages.map((item) => (
                  <div key={item.id} className="grid gap-1">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="h-20 w-full rounded-[var(--radius-md)] object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => removeEditImage(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
        title={confirm?.type === 'vehicle' ? 'Delete vehicle' : 'Delete image'}
        message={
          confirm?.type === 'vehicle'
            ? 'This removes the vehicle from inventory.'
            : 'This removes the photo from the vehicle.'
        }
        confirmLabel="Delete"
        danger
        loading={saving && Boolean(confirm)}
      />
    </div>
  )
}
