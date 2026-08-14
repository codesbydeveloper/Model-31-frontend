import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Handshake,
  Wallet,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import salespersonService from '../../services/mock/salespersonService'
import appointmentService from '../../services/mock/appointmentService'
import commissionService from '../../services/mock/commissionService'
import { getSoldDeals } from '../../services/mock/soldDealService'

function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function SalespersonDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [person, setPerson] = useState(null)
  const [stats, setStats] = useState(null)
  const [apptStats, setApptStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [todayAppts, setTodayAppts] = useState([])
  const [sold, setSold] = useState([])
  const [commission, setCommission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, s, aStats, up, allAppts, deals, comm] = await Promise.all([
        salespersonService.getCurrentSalesperson(),
        salespersonService.getSalespersonStats(),
        appointmentService.getAppointmentStats('sp_001'),
        appointmentService.getUpcomingAppointments('sp_001', 5),
        appointmentService.getAppointments('sp_001'),
        getSoldDeals('sp_001'),
        commissionService.getCommissionSummary('sp_001', 'current'),
      ])
      setPerson(p)
      setStats(s)
      setApptStats(aStats)
      setUpcoming(up)
      setTodayAppts(allAppts.filter((a) => a.date === '2026-08-14').slice(0, 5))
      setSold(deals.slice(0, 5))
      setCommission(comm)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const toggleStatus = async () => {
    if (!person) return
    setUpdating(true)
    try {
      const next = person.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
      const updated = await salespersonService.updateSalespersonStatus(
        person.id,
        next,
      )
      setPerson(updated)
      showToast(
        next === 'ONLINE'
          ? 'You are available for new leads.'
          : 'You are currently offline.',
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !person || !stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const greetingHour = new Date().getHours()
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 18 ? 'Good Afternoon' : 'Good Evening'
  const firstName = (user?.name || person.name).split(' ')[0]

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`${person.dealership} · Salesperson portal`}
      />

      <Card className="mb-5">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="text-sm text-[var(--text-secondary)]">Current status</p>
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
              <StatusBadge status={person.status} />
              <span className="text-lg font-semibold">{person.status}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {person.status === 'ONLINE'
                ? 'You are available for new leads.'
                : 'You are currently offline.'}
            </p>
          </div>
          <Button
            className="min-h-14 w-full px-6 text-base sm:w-auto"
            onClick={toggleStatus}
            disabled={updating}
          >
            {updating ? (
              <LoadingSpinner size={18} />
            ) : person.status === 'ONLINE' ? (
              'GO OFFLINE'
            ) : (
              'GO ONLINE'
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Today's Appointments"
          value={formatNumber(apptStats?.todaysAppointments || 0)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Upcoming"
          value={formatNumber(apptStats?.upcoming || 0)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Sold This Month"
          value={formatNumber(commission?.currentMonthSales || 0)}
          icon={Handshake}
        />
        <StatCard
          label="Commission"
          value={`$${formatNumber(commission?.currentMonthCommission || 0)}`}
          icon={Wallet}
        />
        <StatCard label="Today's Leads" value={formatNumber(stats.todaysLeads)} icon={Inbox} />
        <StatCard label="Accepted" value={formatNumber(stats.accepted)} icon={CheckCircle2} />
        <StatCard label="Declined" value={formatNumber(stats.declined)} icon={XCircle} />
        <StatCard label="Appointments" value={formatNumber(stats.appointments)} icon={CalendarCheck} />
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Today's Appointments</h2>
          <Link to="/salesperson/appointments">
            <Button size="sm" variant="ghost">
              View all
            </Button>
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No appointments today.</p>
        ) : (
          <ul className="space-y-2">
            {todayAppts.map((apt) => (
              <li
                key={apt.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold">{apt.customerName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatTime(apt.time)} · {apt.vehicle}
                  </p>
                </div>
                <Link to={`/salesperson/appointments/${apt.id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Upcoming Appointments</h2>
          <Link to="/salesperson/appointments">
            <Button size="sm" variant="ghost">
              View all
            </Button>
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No upcoming appointments.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((apt) => (
              <li
                key={apt.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold">{apt.customerName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {apt.date} · {formatTime(apt.time)} · {apt.vehicle}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
                <Link to={`/salesperson/appointments/${apt.id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Sold Deals</h2>
          <Link to="/salesperson/sold-deals">
            <Button size="sm" variant="ghost">
              View all
            </Button>
          </Link>
        </div>
        {sold.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No sold deals yet.</p>
        ) : (
          <ul className="space-y-2">
            {sold.map((deal) => (
              <li
                key={deal.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <p className="text-sm font-semibold">{deal.customerName}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {deal.vehicle} · ${formatNumber(deal.salePrice)} · {deal.saleDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-base font-semibold">Commission Summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)]">This month</p>
            <p className="text-lg font-semibold">
              ${formatNumber(commission?.currentMonthCommission || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Pending</p>
            <p className="text-lg font-semibold">
              ${formatNumber(commission?.pendingCommission || 0)}
            </p>
          </div>
        </div>
        <Link to="/salesperson/commission" className="mt-3 inline-block">
          <Button size="sm" variant="secondary">
            Open Commission
          </Button>
        </Link>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/salesperson/incoming-leads">
          <Button className="min-h-12 w-full">Incoming Leads</Button>
        </Link>
        <Link to="/salesperson/leads">
          <Button variant="secondary" className="min-h-12 w-full">
            My Leads
          </Button>
        </Link>
      </div>
    </div>
  )
}
