import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import InventoryVehicleFields, {
  EMPTY_VEHICLE_FORM,
  vehicleFormError,
  vehicleFormFromRow,
} from '../../components/inventory/InventoryVehicleFields'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerInventory,
  createInventoryManagerVehicle,
  updateInventoryManagerVehicle,
  deleteInventoryManagerVehicle,
} from '../../services/api/inventoryManagerService'

export default function MerchandisingInventoryPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
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

  const save = async (event) => {
    event.preventDefault()
    const message = vehicleFormError(form)
    if (message) {
      showToast(message, 'error')
      return
    }
    setSaving(true)
    try {
      await createInventoryManagerVehicle(form)
      setAddOpen(false)
      setForm(EMPTY_VEHICLE_FORM)
      showToast('Vehicle added.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to add the vehicle.', 'error')
    } finally {
      setSaving(false)
    }
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
      await updateInventoryManagerVehicle(editingId, editForm)
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
      await deleteInventoryManagerVehicle(confirm.id)
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
            rows={rows.map((row, index) => ({ ...row, srNo: index + 1 }))}
            emptyTitle="No vehicles."
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
                render: (row) => formatMoney(row.price),
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
