import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
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
import { formatCurrencyRange, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import personaService from '../../services/api/personaService'
import { LANGUAGES } from '../../data/settings'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const EMPTY = {
  name: '',
  description: '',
  minBudget: '',
  maxBudget: '',
  vehiclePreference: '',
  buyingTimeline: '',
  financingPreference: '',
  language: 'English',
  status: 'Active',
}

function displayValue(value) {
  if (value == null || value === '') return '—'
  return value
}

function displayBudget(minBudget, maxBudget) {
  if (minBudget == null && maxBudget == null) return '—'
  if (!minBudget && !maxBudget) return '—'
  return formatCurrencyRange(minBudget || 0, maxBudget || 0)
}

export default function BuyerPersonasPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await personaService.getPersonas({
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
      showToast(err.message || 'Unable to load buyer personas.', 'error')
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

  const fillForm = (row) => ({
    ...EMPTY,
    ...row,
    minBudget: row.minBudget == null ? '' : String(row.minBudget),
    maxBudget: row.maxBudget == null ? '' : String(row.maxBudget),
  })

  const openEdit = async (row) => {
    setEditing(row)
    setForm(fillForm(row))
    setErrors({})
    setModalOpen(true)
    try {
      const persona = await personaService.getPersonaById(row.id)
      if (persona) {
        setEditing(persona)
        setForm(fillForm(persona))
      }
    } catch (err) {
      showToast(err.message || 'Unable to load persona.', 'error')
    }
  }

  const openView = async (row) => {
    setViewing(row)
    try {
      const persona = await personaService.getPersonaById(row.id)
      if (persona) setViewing(persona)
    } catch (err) {
      showToast(err.message || 'Unable to load persona.', 'error')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!String(form.name || '').trim()) next.name = 'Persona name is required.'
    if (!form.minBudget) next.minBudget = 'Minimum budget is required.'
    if (!form.maxBudget) next.maxBudget = 'Maximum budget is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      if (editing) {
        await personaService.updatePersona(editing.id, form)
        showToast('Buyer persona updated successfully.')
      } else {
        await personaService.createPersona(form)
        showToast('Buyer persona added successfully.')
      }
      setModalOpen(false)
      if (editing || page === 1) {
        await load()
      } else {
        setPage(1)
      }
    } catch (err) {
      showToast(err.message || 'Unable to save persona.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await personaService.deletePersona(deleting.id)
      showToast('Buyer persona deleted successfully.')
      setDeleting(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete persona.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="line-clamp-2 max-w-xs text-[var(--text-secondary)]">
          {displayValue(row.description)}
        </span>
      ),
    },
    {
      key: 'budget',
      label: 'Budget Range',
      render: (row) => displayBudget(row.minBudget, row.maxBudget),
    },
    {
      key: 'vehiclePreference',
      label: 'Vehicle Preference',
      render: (row) => displayValue(row.vehiclePreference),
    },
    {
      key: 'buyingTimeline',
      label: 'Buying Timeline',
      render: (row) => displayValue(row.buyingTimeline),
    },
    {
      key: 'financingPreference',
      label: 'Financing Preference',
      render: (row) => displayValue(row.financingPreference),
    },
    { key: 'language', label: 'Language' },
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
          <Button variant="ghost" size="sm" onClick={() => openView(row)}>
            <Eye size={14} />
            View
          </Button>
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
        title="Buyer Personas"
        description="Define and manage automotive buyer personas used by AI qualification."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add Persona
          </Button>
        }
      />

      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personas"
            className="sm:max-w-xs"
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
            emptyTitle="No buyer personas found."
            emptyActionLabel="Add Persona"
            onEmptyAction={openCreate}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Buyer Persona' : 'Add Buyer Persona'}
        className="max-w-2xl"
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Persona Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            containerClassName="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="input-field min-h-24"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Minimum Budget"
            type="number"
            value={form.minBudget}
            onChange={(e) => setForm({ ...form, minBudget: e.target.value })}
            error={errors.minBudget}
          />
          <Input
            label="Maximum Budget"
            type="number"
            value={form.maxBudget}
            onChange={(e) => setForm({ ...form, maxBudget: e.target.value })}
            error={errors.maxBudget}
          />
          <Input
            label="Vehicle Preference"
            value={form.vehiclePreference}
            onChange={(e) => setForm({ ...form, vehiclePreference: e.target.value })}
          />
          <Input
            label="Buying Timeline"
            value={form.buyingTimeline}
            onChange={(e) => setForm({ ...form, buyingTimeline: e.target.value })}
          />
          <Input
            label="Financing Preference"
            value={form.financingPreference}
            onChange={(e) =>
              setForm({ ...form, financingPreference: e.target.value })
            }
          />
          <Select
            label="Language"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            options={LANGUAGES}
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
                'Create Persona'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || 'Persona'}
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <p className="text-[var(--text-secondary)]">
              {displayValue(viewing.description)}
            </p>
            <p>
              <strong>Budget:</strong>{' '}
              {displayBudget(viewing.minBudget, viewing.maxBudget)}
            </p>
            <p>
              <strong>Vehicle:</strong> {displayValue(viewing.vehiclePreference)}
            </p>
            <p>
              <strong>Timeline:</strong> {displayValue(viewing.buyingTimeline)}
            </p>
            <p>
              <strong>Financing:</strong> {displayValue(viewing.financingPreference)}
            </p>
            <p>
              <strong>Language:</strong> {displayValue(viewing.language)}
            </p>
            <StatusBadge status={viewing.status} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete persona"
        message={`Are you sure you want to delete ${deleting?.name}?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
