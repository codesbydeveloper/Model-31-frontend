import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/common/SearchInput'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import cityService from '../../services/api/cityService'
import { LANGUAGES } from '../../data/settings'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const EMPTY = {
  city: '',
  state: '',
  country: 'USA',
  primaryLanguage: 'English',
  secondaryLanguage: '',
  regionalTone: 'Professional',
  inventoryFocus: '',
  financingFocus: 'Financing',
  status: 'Active',
}

export default function CitiesPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('city')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await cityService.getCities({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load cities.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(
    () => sortBy(rows, sortKey, sortDir),
    [rows, sortKey, sortDir],
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setErrors({})
    setEditing(row)
    setForm({ ...EMPTY, ...row })
    setModalOpen(true)
    try {
      const city = await cityService.getCityById(row.id)
      if (city) {
        setEditing(city)
        setForm({ ...EMPTY, ...city })
      }
    } catch (err) {
      showToast(err.message || 'Unable to load city.', 'error')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!String(form.city || '').trim()) next.city = 'City is required.'
    if (!String(form.state || '').trim()) next.state = 'State is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      if (editing) {
        await cityService.updateCity(editing.id, form)
        showToast('City updated successfully.')
      } else {
        await cityService.createCity(form)
        showToast('City added successfully.')
      }
      setModalOpen(false)
      if (editing || page === 1) {
        await load()
      } else {
        setPage(1)
      }
    } catch (err) {
      showToast(err.message || 'Unable to save city.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await cityService.deleteCity(deleting.id)
      showToast('City deleted successfully.')
      setDeleting(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete city.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    {
      key: 'language',
      label: 'Language',
      render: (row) =>
        [row.primaryLanguage, row.secondaryLanguage].filter(Boolean).join(' / '),
    },
    { key: 'regionalTone', label: 'Regional Tone', sortable: true },
    { key: 'inventoryFocus', label: 'Inventory Focus' },
    { key: 'financingFocus', label: 'Financing Focus' },
    { key: 'dealerships', label: 'Dealerships', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(row)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Cities"
        description="Configure supported cities and regional market settings."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add City
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities"
            className="sm:max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            className="sm:w-44"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={(key) => {
              if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
              else {
                setSortKey(key)
                setSortDir('asc')
              }
            }}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            onPageChange={setPage}
            emptyTitle="No cities found."
            emptyActionLabel="Add City"
            onEmptyAction={openCreate}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit City' : 'Add City'}
        className="max-w-2xl"
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={errors.city}
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            error={errors.state}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <Select
            label="Primary Language"
            value={form.primaryLanguage}
            onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value })}
            options={LANGUAGES}
          />
          <Input
            label="Secondary Language"
            value={form.secondaryLanguage}
            onChange={(e) => setForm({ ...form, secondaryLanguage: e.target.value })}
          />
          <Input
            label="Regional Tone"
            value={form.regionalTone}
            onChange={(e) => setForm({ ...form, regionalTone: e.target.value })}
          />
          <Input
            label="Inventory Focus"
            value={form.inventoryFocus}
            onChange={(e) => setForm({ ...form, inventoryFocus: e.target.value })}
          />
          <Select
            label="Financing Focus"
            value={form.financingFocus}
            onChange={(e) => setForm({ ...form, financingFocus: e.target.value })}
            options={['Lease', 'Financing', 'Cash', 'Lease / Financing']}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active', 'Inactive']}
          />
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size={16} />
                  Saving…
                </>
              ) : editing ? (
                'Save Changes'
              ) : (
                'Create City'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete city"
        message={`Are you sure you want to delete ${deleting?.city}?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
