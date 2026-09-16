import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Handshake,
  Wallet,
  FileText,
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
import {
  getSalespersonDashboard,
  updateSalespersonPresence,
} from '../../services/api/salespersonPortalService'
import { getSalespersonScripts } from '../../services/api/salespersonScriptService'

function formatTime(time) {
  if (!time) return ''
  if (/am|pm/i.test(String(time))) return String(time)
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h)) return String(time)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${period}`
}

export default function SalespersonDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [dashboard, setDashboard] = useState(null)
  const [pendingScripts, setPendingScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSalespersonDashboard()
      setDashboard(data)
      if (data.pendingScripts?.length) {
        setPendingScripts(data.pendingScripts)
      } else {
        const scripts = await getSalespersonScripts({
          page: 1,
          limit: 5,
          status: 'PENDING',
        })
        setPendingScripts(scripts.items || [])
      }
    } catch (err) {
      setDashboard(null)
      setPendingScripts([])
      showToast(err.message || 'Unable to load dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const toggleStatus = async () => {
    if (!dashboard) return
    setUpdating(true)
    try {
      const next = dashboard.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
      const updated = await updateSalespersonPresence(next)
      setDashboard((current) => ({
        ...current,
        status: updated.status,
      }))
      showToast(
        next === 'ONLINE'
          ? 'You are available for new leads.'
          : 'You are currently offline.',
      )
    } catch (err) {
      showToast(err.message || 'Unable to update presence.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const greetingHour = new Date().getHours()
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 18 ? 'Good Afternoon' : 'Good Evening'
  const firstName = (user?.name || dashboard?.name || 'there').split(' ')[0]
  const status = dashboard?.status || 'OFFLINE'
  const stats = dashboard?.stats || {}
  const commission = dashboard?.commission || {}
  const todayAppts = dashboard?.todayAppointments || []
  const upcoming = dashboard?.upcomingAppointments || []
  const sold = dashboard?.recentSoldDeals || []

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`${dashboard?.dealership || user?.dealership || 'Salesperson portal'} · Salesperson portal`}
      />

      <Card className="mb-5">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="text-sm text-[var(--text-secondary)]">Current status</p>
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
              <StatusBadge status={status} />
              <span className="text-lg font-semibold">{status}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {status === 'ONLINE'
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
            ) : status === 'ONLINE' ? (
              'GO OFFLINE'
            ) : (
              'GO ONLINE'
            )}
          </Button>
        </div>
      </Card>

      <Card className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Pending Scripts</h2>
          <Link to="/salesperson/scripts">
            <Button size="sm" variant="ghost">
              View all
            </Button>
          </Link>
        </div>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          Approve the words, then copy them into CapCut or Instagram yourself.
        </p>
        {pendingScripts.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No scripts waiting for approval.</p>
        ) : (
          <ul className="space-y-2">
            {pendingScripts.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold">{item.customerName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {item.vehicle} · {item.platform}
                  </p>
                </div>
                <Link to={`/salesperson/scripts/${item.id}`}>
                  <Button size="sm">Approve</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Today's Appointments"
          value={formatNumber(stats.todaysAppointments || 0)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Upcoming"
          value={formatNumber(stats.upcoming || 0)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Sold This Month"
          value={formatNumber(commission.currentMonthSales || stats.soldThisMonth || 0)}
          icon={Handshake}
        />
        <StatCard
          label="Commission"
          value={`$${formatNumber(commission.currentMonthCommission || stats.commission || 0)}`}
          icon={Wallet}
        />
        <StatCard label="Pending Scripts" value={formatNumber(pendingScripts.length)} icon={FileText} />
        <StatCard label="Today's Leads" value={formatNumber(stats.todaysLeads || 0)} icon={Inbox} />
        <StatCard label="Accepted" value={formatNumber(stats.accepted || 0)} icon={CheckCircle2} />
        <StatCard label="Declined" value={formatNumber(stats.declined || 0)} icon={XCircle} />
        <StatCard label="Appointments" value={formatNumber(stats.appointments || 0)} icon={CalendarCheck} />
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
              ${formatNumber(commission.currentMonthCommission || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Pending</p>
            <p className="text-lg font-semibold">
              ${formatNumber(commission.pendingCommission || 0)}
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
        <Link to="/salesperson/scripts">
          <Button className="min-h-12 w-full">Sales Scripts</Button>
        </Link>
        <Link to="/salesperson/incoming-leads">
          <Button variant="secondary" className="min-h-12 w-full">
            Incoming Leads
          </Button>
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
