import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerInventory,
  createInventoryManagerVehicle,
  updateInventoryManagerVehicle,
  deleteInventoryManagerImage,
  deleteInventoryManagerVehicle,
} from '../../services/api/inventoryManagerService'

const EMPTY_FORM = {
  vehicle: '',
  year: '',
  make: '',
  model: '',
  vin: '',
  price: '',
  images: [''],
}

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export default function MerchandisingInventoryPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editOpen, setEditOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [editImages, setEditImages] = useState([])
  const [savedImages, setSavedImages] = useState([])
  const editFileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getInventoryManagerInventory())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load inventory.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const setImage = (index, value) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    if (!form.vehicle.trim() && !(form.make.trim() && form.model.trim())) {
      showToast('Enter a vehicle name, or a make and model.', 'error')
      return
    }
    setSaving(true)
    try {
      await createInventoryManagerVehicle(form)
      setAddOpen(false)
      setForm(EMPTY_FORM)
      showToast('Vehicle added.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to add the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const clearEditImages = () => {
    setEditImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview))
      return []
    })
  }

  const openEdit = (row) => {
    clearEditImages()
    setEditingId(row.id)
    setSavedImages(row.images || [])
    setEditForm({
      vehicle: row.vehicle || '',
      year: row.year == null ? '' : String(row.year),
      make: row.make || '',
      model: row.model || '',
      vin: row.vin || '',
      price: row.price == null ? '' : String(row.price),
      images: [''],
    })
    setEditOpen(true)
  }

  const setEditField = (key) => (event) => {
    setEditForm((current) => ({ ...current, [key]: event.target.value }))
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

  const saveEdit = async (event) => {
    event.preventDefault()
    if (!editForm.vehicle.trim() && !(editForm.make.trim() && editForm.model.trim())) {
      showToast('Enter a vehicle name, or a make and model.', 'error')
      return
    }
    setSaving(true)
    try {
      await updateInventoryManagerVehicle(editingId, {
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
        await deleteInventoryManagerImage(editingId, confirm.imageId)
        setSavedImages((current) => current.filter((item) => item.id !== confirm.imageId))
        showToast('Image deleted.')
      } else {
        await deleteInventoryManagerVehicle(confirm.id)
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

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader
        title="Merchandising Inventory"
        description="Vehicle photos, price, and listing status."
        actions={<Button onClick={() => setAddOpen(true)}>Add Inventory</Button>}
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No vehicles."
            columns={[
              { key: 'stockNumber', label: 'Stock #' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'vin', label: 'VIN' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => formatMoney(row.price),
              },
              { key: 'daysInStock', label: 'Days' },
              { key: 'photoCount', label: 'Photos' },
              {
                key: 'merchStatus',
                label: 'Status',
                render: (row) => <StatusBadge status={row.merchStatus} />,
              },
              {
                key: 'action',
                label: '',
                render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" disabled={saving} onClick={() => deleteVehicle(row.id)}>
                      Delete
                    </Button>
                    <Link to={`/merchandising/inventory/${row.id}`}>
                      <Button size="sm" variant="ghost">
                        Open
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal open={addOpen} onClose={() => !saving && setAddOpen(false)} title="Add Inventory">
        <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={save}>
          <Input label="Vehicle" value={form.vehicle} onChange={setField('vehicle')} placeholder="2024 Toyota Camry" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Year" value={form.year} onChange={setField('year')} inputMode="numeric" />
            <Input label="Make" value={form.make} onChange={setField('make')} />
            <Input label="Model" value={form.model} onChange={setField('model')} />
            <Input label="VIN" value={form.vin} onChange={setField('vin')} />
            <Input label="Price" value={form.price} onChange={setField('price')} inputMode="decimal" />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Images</p>
            {form.images.map((image, index) => (
              <div key={index} className="flex items-end gap-2">
                <Input
                  containerClassName="min-w-0 flex-1"
                  label={index === 0 ? 'Image link' : ''}
                  value={image}
                  onChange={(event) => setImage(index, event.target.value)}
                  placeholder="https://example.com/front.jpg"
                />
                {form.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={saving}
                    onClick={() => setForm((current) => ({
                      ...current,
                      images: current.images.filter((_, itemIndex) => itemIndex !== index),
                    }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              disabled={saving || form.images.length >= 10}
              onClick={() => setForm((current) => ({ ...current, images: [...current.images, ''] }))}
            >
              Add another image
            </Button>
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
          <Input label="Vehicle" value={editForm.vehicle} onChange={setEditField('vehicle')} placeholder="2024 Toyota Camry" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Year" value={editForm.year} onChange={setEditField('year')} inputMode="numeric" />
            <Input label="Make" value={editForm.make} onChange={setEditField('make')} />
            <Input label="Model" value={editForm.model} onChange={setEditField('model')} />
            <Input label="VIN" value={editForm.vin} onChange={setEditField('vin')} />
            <Input label="Price" value={editForm.price} onChange={setEditField('price')} inputMode="decimal" />
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
