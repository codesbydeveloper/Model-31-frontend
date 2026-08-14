import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
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
import { sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import userService from '../../services/mock/userService'
import { USER_ROLES, USER_STATUSES } from '../../data/platformUsers'
import { initialDealerships } from '../../data/dealerships'

const EMPTY = {
  name: '',
  email: '',
  role: 'Salesperson',
  dealership: 'Miami Luxury Motors',
  phone: '',
  status: 'Active',
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const dealershipOptions = useMemo(
    () => [
      'AutoFlow Corporate',
      ...initialDealerships.map((d) => d.name),
      'Unassigned',
    ],
    [],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await userService.getUsers())
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

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.dealership.toLowerCase().includes(q),
      )
    }
    if (roleFilter !== 'all') list = list.filter((r) => r.role === roleFilter)
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    return sortBy(list, sortKey, sortDir)
  }, [rows, search, roleFilter, statusFilter, sortKey, sortDir])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      email: row.email,
      role: row.role,
      dealership: row.dealership,
      phone: row.phone,
      status: row.status,
    })
    setErrors({})
    setModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      if (editing) {
        await userService.updateUser(editing.id, form)
        showToast('User updated successfully.')
      } else {
        await userService.createUser(form)
        showToast('User added successfully.')
      }
      setModalOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'dealership', label: 'Dealership', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'lastActive', label: 'Last Active', sortable: true },
    { key: 'createdDate', label: 'Created Date', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
          <Pencil size={14} />
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Users & Roles"
        description="Manage platform users and role assignments."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add User
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search users"
          />
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All roles' },
              ...USER_ROLES.map((r) => ({ value: r, label: r })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...USER_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
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
            emptyTitle="No users found."
            emptyActionLabel="Add User"
            onEmptyAction={openCreate}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
        className="max-w-xl"
      >
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={USER_ROLES}
          />
          <Select
            label="Dealership"
            value={form.dealership}
            onChange={(e) => setForm({ ...form, dealership: e.target.value })}
            options={dealershipOptions}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={USER_STATUSES}
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
                'Add User'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
