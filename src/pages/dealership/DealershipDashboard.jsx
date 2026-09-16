import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  Target,
  UserCheck,
  CalendarCheck,
  Handshake,
  Wallet,
  Percent,
  BadgeDollarSign,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatNumber, formatPercent } from '../../utils/table'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getDealershipDashboard } from '../../services/api/dealershipReportService'

const EMPTY_DASHBOARD = {
  dealership: '',
  leadsToday: 0,
  qualifiedLeads: 0,
  assignedLeads: 0,
  appointments: 0,
  soldDeals: 0,
  revenue: 0,
  conversionRate: 0,
  averageDeal: 0,
  leadTrend: [],
  leadSources: [],
  salesFunnel: [],
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function stageShare(count, previous) {
  if (!previous) return null
  return `${Math.round((Number(count) / Number(previous)) * 100)}%`
}

export default function DealershipDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getDealershipDashboard())
    } catch (err) {
      setData(EMPTY_DASHBOARD)
      showToast(err.message || 'Unable to load dealership dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} label="Loading dealership dashboard…" />
      </div>
    )
  }

  const funnel = data.salesFunnel || []
  const maxFunnel = Math.max(...funnel.map((step) => step.count), 1)
  const sourceTotal = (data.leadSources || []).reduce((sum, row) => sum + Number(row.value || 0), 0)
  const dealershipName = data.dealership || user?.dealership || 'Dealership'

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title={dealershipName}
        description="Live operations overview for leads, appointments and sales."
        actions={
          <>
            <Link to="/dealership/leads">
              <Button size="sm">View Leads</Button>
            </Link>
            <Link to="/dealership/reports">
              <Button size="sm" variant="secondary">
                Reports
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Leads Today"
          value={formatNumber(data.leadsToday)}
          hint="Created today"
          icon={Inbox}
        />
        <StatCard
          label="Qualified Leads"
          value={formatNumber(data.qualifiedLeads)}
          hint="In pipeline"
          icon={Target}
        />
        <StatCard
          label="Assigned Leads"
          value={formatNumber(data.assignedLeads)}
          hint="Has a salesperson"
          icon={UserCheck}
        />
        <StatCard
          label="Appointments"
          value={formatNumber(data.appointments)}
          hint="All appointments"
          icon={CalendarCheck}
        />
        <StatCard
          label="Sold Deals"
          value={formatNumber(data.soldDeals)}
          hint="Closed deals"
          icon={Handshake}
        />
        <StatCard
          label="Revenue"
          value={formatMoney(data.revenue)}
          hint="From sold deals"
          icon={Wallet}
        />
        <StatCard
          label="Conversion"
          value={formatPercent(data.conversionRate)}
          hint="Sold vs qualified"
          icon={Percent}
        />
        <StatCard
          label="Average Deal"
          value={formatMoney(data.averageDeal)}
          hint="Revenue per sold deal"
          icon={BadgeDollarSign}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Lead Trend</h2>
          {data.leadTrend?.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.leadTrend}>
                  <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" name="Leads" stroke="#0f2b46" strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="qualified"
                    name="Qualified"
                    stroke="#1a7a4c"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              className="py-10"
              title="No lead trend yet"
              description="New leads for this dealership will show here."
            />
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Lead Sources</h2>
          {data.leadSources?.length ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leadSources}>
                    <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a6b8a" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                {data.leadSources.map((row) => (
                  <li key={row.name} className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-2 py-2">
                    <p className="text-xs text-[var(--text-muted)]">{row.name}</p>
                    <p className="font-semibold">{formatNumber(row.value)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {sourceTotal ? `${Math.round((row.value / sourceTotal) * 100)}%` : '0%'}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              className="py-10"
              title="No sources yet"
              description="Lead sources for this dealership will show here."
            />
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Sales Funnel</h2>
          <Link to="/dealership/salespeople">
            <Button size="sm" variant="ghost">
              Sales team
            </Button>
          </Link>
        </div>
        {funnel.length ? (
          <div className="flex flex-col items-center gap-1">
            <p className="mb-3 w-full max-w-xl text-xs text-[var(--text-secondary)]">
              Leads Today is new today. Qualified through Sold are lifetime totals for this
              dealership.
            </p>
            {funnel.map((step, index) => {
              const previous = index > 0 ? funnel[index - 1].count : null
              const comparable = previous != null && previous > 0 && step.count <= previous
              const width = Math.max(28, (step.count / maxFunnel) * 100)
              return (
                <div key={step.stage} className="flex w-full max-w-xl flex-col items-center">
                  {index > 0 && (
                    <p className="py-1 text-xs font-medium text-[var(--text-muted)]">
                      ↓ {comparable ? stageShare(step.count, previous) : ''}
                    </p>
                  )}
                  <div
                    className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-center"
                    style={{ width: `${width}%` }}
                  >
                    <p className="text-sm text-[var(--text-secondary)]">{step.stage}</p>
                    <p className="text-xl font-semibold">{formatNumber(step.count)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            className="py-10"
            title="No funnel data"
            description="Pipeline stages will appear once this dealership has leads."
          />
        )}
      </Card>
    </div>
  )
}
