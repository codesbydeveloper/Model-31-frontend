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
import userService from '../../services/api/userService'
import dealershipService from '../../services/api/dealershipService'
import { USER_ROLES, USER_STATUSES } from '../../data/platformUsers'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400
const UNASSIGNED = { value: 'Unassigned', label: 'Unassigned' }

const EMPTY = {
  name: '',
  email: '',
  password: '',
  role: 'Salesperson',
  dealership: 'Unassigned',
  phone: '',
  status: 'Active',
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name')
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
  const [dealershipOptions, setDealershipOptions] = useState([UNASSIGNED])

  const loadDealershipOptions = useCallback(async () => {
    try {
      const options = await dealershipService.getDealershipOptions()
      const real = options.filter(
        (option) =>
          option.value &&
          option.value !== UNASSIGNED.value &&
          option.label !== UNASSIGNED.label,
      )
      setDealershipOptions([UNASSIGNED, ...real])
    } catch (err) {
      setDealershipOptions([UNASSIGNED])
      showToast(err.message || 'Unable to load dealerships.', 'error')
    }
  }, [showToast])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await userService.getUsers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        role: roleFilter,
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
      showToast(err.message || 'Unable to load users.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, roleFilter, statusFilter, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDealershipOptions()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadDealershipOptions])

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

  const matchDealershipValue = (row) => {
    if (row?.dealershipId) {
      const byId = dealershipOptions.find((option) => option.value === row.dealershipId)
      if (byId) return byId.value
    }
    if (!row?.dealership) return UNASSIGNED.value
    const match = dealershipOptions.find(
      (option) => option.value === row.dealership || option.label === row.dealership,
    )
    return match?.value || UNASSIGNED.value
  }

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
      password: '',
      role: row.role,
      dealership: matchDealershipValue(row),
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
    if (!editing && !form.password.trim()) next.password = 'Password is required.'
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
      if (editing || page === 1) {
        await load()
      } else {
        setPage(1)
      }
    } catch (err) {
      showToast(err.message || 'Unable to save user.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    setDeleteLoading(true)
    try {
      await userService.deleteUser(deleting.id)
      showToast('User deleted successfully.')
      setDeleting(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete user.', 'error')
    } finally {
      setDeleteLoading(false)
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
            onChange={(e) => setSearch(e.target.value)}
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
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
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
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            placeholder={editing ? 'Leave blank to keep current password' : ''}
            autoComplete={editing ? 'new-password' : 'new-password'}
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

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => !deleteLoading && setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete user"
        message={`Are you sure you want to delete ${deleting?.name}?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
