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
import appointmentService from '../../services/mock/appointmentService'
import AppointmentCalendar from './appointments/AppointmentCalendar'
import CreateAppointmentModal from './appointments/CreateAppointmentModal'

const EMPTY_FILTERS = {
  status: 'all',
  type: 'all',
  date: '',
  salesperson: 'all',
  dealership: 'all',
}

function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function SalespersonAppointmentsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
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
      const [list, summary] = await Promise.all([
        appointmentService.getAppointments('sp_001'),
        appointmentService.getAppointmentStats('sp_001'),
      ])
      setRows(list)
      setStats(summary)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const salespeople = useMemo(
    () => [...new Set(rows.map((r) => r.salesperson))].sort(),
    [rows],
  )
  const dealerships = useMemo(
    () => [...new Set(rows.map((r) => r.dealership))].sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          String(r.leadId).toLowerCase().includes(q) ||
          r.vehicle.toLowerCase().includes(q) ||
          r.salesperson.toLowerCase().includes(q),
      )
    }
    if (filters.status !== 'all') list = list.filter((r) => r.status === filters.status)
    if (filters.type !== 'all') list = list.filter((r) => r.type === filters.type)
    if (filters.date) list = list.filter((r) => r.date === filters.date)
    if (filters.salesperson !== 'all') {
      list = list.filter((r) => r.salesperson === filters.salesperson)
    }
    if (filters.dealership !== 'all') {
      list = list.filter((r) => r.dealership === filters.dealership)
    }
    return list
  }, [rows, search, filters])

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
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'dealership', label: 'Dealership' },
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
        <StatCard label="Today's Appointments" value={formatNumber(stats?.todaysAppointments || 0)} />
        <StatCard label="Upcoming" value={formatNumber(stats?.upcoming || 0)} />
        <StatCard label="Confirmed" value={formatNumber(stats?.confirmed || 0)} />
        <StatCard label="Completed" value={formatNumber(stats?.completed || 0)} />
        <StatCard label="No Show" value={formatNumber(stats?.noShow || 0)} />
        <StatCard label="Cancelled" value={formatNumber(stats?.cancelled || 0)} />
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
              setPage(1)
            }}
            placeholder="Search customer, lead, vehicle…"
            className="xl:col-span-2"
          />
          <Select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }))
              setPage(1)
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
              setPage(1)
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
              setPage(1)
            }}
          />
          <Select
            value={filters.salesperson}
            onChange={(e) => {
              setFilters((f) => ({ ...f, salesperson: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All salespeople' },
              ...salespeople.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={filters.dealership}
            onChange={(e) => {
              setFilters((f) => ({ ...f, dealership: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All dealerships' },
              ...dealerships.map((s) => ({ value: s, label: s })),
            ]}
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
            pageSize={10}
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
