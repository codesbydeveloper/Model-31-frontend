import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from '../../data/appointments'
import salespersonAppointmentService from '../../services/api/salespersonAppointmentService'
import AppointmentCalendar from './appointments/AppointmentCalendar'
import CreateAppointmentModal from './appointments/CreateAppointmentModal'

const PAGE_SIZE = 10
const EMPTY_FILTERS = {
  status: 'all',
  type: 'all',
  date: '',
}

function formatTime(time) {
  if (!time) return '—'
  if (/am|pm/i.test(String(time))) return String(time)
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h)) return String(time)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${period}`
}

export default function SalespersonAppointmentsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [calendarMode, setCalendarMode] = useState('month')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await salespersonAppointmentService.getSalespersonAppointments({
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load appointments.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          String(r.leadId).toLowerCase().includes(q) ||
          String(r.vehicle || '').toLowerCase().includes(q),
      )
    }
    if (filters.status !== 'all') list = list.filter((r) => r.status === filters.status)
    if (filters.type !== 'all') list = list.filter((r) => r.type === filters.type)
    if (filters.date) list = list.filter((r) => r.date === filters.date)
    return list
  }, [rows, search, filters])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      todaysAppointments: rows.filter((r) => r.date === today).length,
      upcoming: rows.filter((r) => r.date >= today && r.status !== 'CANCELLED').length,
      confirmed: rows.filter((r) => String(r.status).toUpperCase() === 'CONFIRMED').length,
      completed: rows.filter((r) => String(r.status).toUpperCase() === 'COMPLETED').length,
      noShow: rows.filter((r) => /no.?show/i.test(r.status)).length,
      cancelled: rows.filter((r) => String(r.status).toUpperCase() === 'CANCELLED').length,
    }
  }, [rows])

  const clearFilters = () => {
    setSearch('')
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'date', label: 'Date' },
    {
      key: 'time',
      label: 'Time',
      render: (row) => formatTime(row.time),
    },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Link to={`/salesperson/appointments/${row.id}`}>
          <Button size="sm" variant="ghost">
            View
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Appointments"
        description="Manage upcoming customer appointments and follow-ups."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            New Appointment
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Today's Appointments" value={formatNumber(stats.todaysAppointments)} />
        <StatCard label="Upcoming" value={formatNumber(stats.upcoming)} />
        <StatCard label="Confirmed" value={formatNumber(stats.confirmed)} />
        <StatCard label="Completed" value={formatNumber(stats.completed)} />
        <StatCard label="No Show" value={formatNumber(stats.noShow)} />
        <StatCard label="Cancelled" value={formatNumber(stats.cancelled)} />
      </div>

      <div className="mt-5 mb-4 flex gap-2">
        <Button
          size="sm"
          variant={view === 'calendar' ? 'primary' : 'secondary'}
          onClick={() => setView('calendar')}
        >
          Calendar
        </Button>
        <Button
          size="sm"
          variant={view === 'list' ? 'primary' : 'secondary'}
          onClick={() => setView('list')}
        >
          List
        </Button>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
            placeholder="Search customer, lead, vehicle…"
            className="xl:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }))
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={filters.type}
            onChange={(e) => {
              setFilters((f) => ({ ...f, type: e.target.value }))
            }}
            options={[
              { value: 'all', label: 'All types' },
              ...APPOINTMENT_TYPES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <InputDate
            value={filters.date}
            onChange={(value) => {
              setFilters((f) => ({ ...f, date: value }))
            }}
          />
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : view === 'calendar' ? (
          <AppointmentCalendar
            appointments={filtered}
            mode={calendarMode}
            onModeChange={setCalendarMode}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No appointments found."
            emptyDescription="Try adjusting your search or filters."
            emptyActionLabel="Clear Filters"
            onEmptyAction={clearFilters}
          />
        )}
      </Card>

      <CreateAppointmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          showToast('Appointment scheduled successfully.')
          setCreateOpen(false)
          await load()
        }}
      />
    </div>
  )
}

function InputDate({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field"
      aria-label="Filter by date"
    />
  )
}
