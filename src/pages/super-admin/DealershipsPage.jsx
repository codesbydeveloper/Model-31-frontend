import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Power } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/common/SearchInput'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import dealershipService from '../../services/mock/dealershipService'
import { TIMEZONES } from '../../data/settings'

const EMPTY_FORM = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
  brands: '',
  timezone: 'America/New_York',
  status: 'Active',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Dealership name is required.'
  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State is required.'
  if (!form.phone.trim()) errors.phone = 'Phone is required.'
  return errors
}

export default function DealershipsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [crmFilter, setCrmFilter] = useState('all')
  const [socialFilter, setSocialFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dealershipService.getDealerships()
      setRows(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city))].sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    if (cityFilter !== 'all') list = list.filter((r) => r.city === cityFilter)
    if (crmFilter !== 'all') list = list.filter((r) => r.crmStatus === crmFilter)
    if (socialFilter !== 'all') {
      list = list.filter((r) => r.socialStatus === socialFilter)
    }
    return sortBy(list, sortKey, sortDir)
  }, [
    rows,
    search,
    statusFilter,
    cityFilter,
    crmFilter,
    socialFilter,
    sortKey,
    sortDir,
  ])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      website: row.website,
      brands: row.brands.join(', '),
      timezone: row.timezone,
      status: row.status,
    })
    setErrors({})
    setModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      if (editing) {
        await dealershipService.updateDealership(editing.id, form)
        showToast('Dealership updated successfully.')
      } else {
        await dealershipService.createDealership(form)
        showToast('Dealership added successfully.')
      }
      setModalOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (row) => {
    await dealershipService.toggleDealershipStatus(row.id)
    showToast(
      row.status === 'Active'
        ? 'Dealership disabled.'
        : 'Dealership enabled.',
    )
    await load()
  }

  const columns = [
    {
      key: 'name',
      label: 'Dealership',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">{row.address}</p>
        </div>
      ),
    },
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    {
      key: 'brands',
      label: 'Brands',
      render: (row) => row.brands.join(', '),
    },
    {
      key: 'salespeople',
      label: 'Salespeople',
      sortable: true,
      render: (row) => formatNumber(row.salespeople),
    },
    {
      key: 'activeLeads',
      label: 'Active Leads',
      sortable: true,
      render: (row) => formatNumber(row.activeLeads),
    },
    {
      key: 'crmStatus',
      label: 'CRM Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.crmStatus} />,
    },
    {
      key: 'socialStatus',
      label: 'Social Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.socialStatus} />,
    },
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
        <div className="flex flex-wrap justify-end gap-1 md:justify-start">
          <Link to={`/super-admin/dealerships/${row.id}`}>
            <Button variant="ghost" size="sm" aria-label="View">
              <Eye size={14} />
              View
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleStatus(row)}>
            <Power size={14} />
            {row.status === 'Active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealerships"
        description="Manage dealerships connected to the Model 31 platform."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add Dealership
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search dealerships"
            className="lg:col-span-2"
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
          />
          <Select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All cities' },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            value={crmFilter}
            onChange={(e) => {
              setCrmFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All CRM' },
              { value: 'Connected', label: 'CRM Connected' },
              { value: 'Partial', label: 'CRM Partial' },
              { value: 'Disconnected', label: 'CRM Disconnected' },
            ]}
          />
          <Select
            value={socialFilter}
            onChange={(e) => {
              setSocialFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All social' },
              { value: 'Connected', label: 'Social Connected' },
              { value: 'Partial', label: 'Social Partial' },
              { value: 'Disconnected', label: 'Social Disconnected' },
            ]}
            className="sm:col-span-2 lg:col-span-1"
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
            onPageChange={setPage}
            emptyTitle="No dealerships found."
            emptyDescription="Add a dealership to get started."
            emptyActionLabel="Add Dealership"
            onEmptyAction={openCreate}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Dealership' : 'Add Dealership'}
        className="max-w-2xl"
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Dealership Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            containerClassName="sm:col-span-2"
          />
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
            label="ZIP Code"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Brands"
            placeholder="BMW, Audi, Mercedes-Benz"
            value={form.brands}
            onChange={(e) => setForm({ ...form, brands: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            options={TIMEZONES}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active', 'Inactive']}
          />
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
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
                'Add Dealership'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
