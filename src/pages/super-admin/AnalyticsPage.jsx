import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber, formatPercent, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import {
  EMPTY_ANALYTICS,
  getPlatformAnalytics,
} from '../../services/api/superAdminAnalyticsService'

function pct(part, whole) {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
}

function scoreLabel(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return value || '—'
  return Number.isInteger(num) ? String(num) : num.toFixed(1)
}

export default function AnalyticsPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('leads')
  const [sortDir, setSortDir] = useState('desc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getPlatformAnalytics())
    } catch (err) {
      setData(EMPTY_ANALYTICS)
      showToast(err.message || 'Unable to load analytics.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const dealershipRows = useMemo(() => {
    if (!data) return []
    return sortBy(data.dealerships, sortKey, sortDir)
  }, [data, sortKey, sortDir])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const { kpis, funnel, sources, ai, sales, salespeople, marketing, journey } = data

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Platform Analytics"
        description="Monitor platform-wide lead, sales, AI, marketing and dealership performance."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Leads" value={formatNumber(kpis.totalLeads)} />
        <StatCard label="Qualified Leads" value={formatNumber(kpis.qualifiedLeads)} />
        <StatCard label="Routed Leads" value={formatNumber(kpis.routedLeads)} />
        <StatCard label="Appointments" value={formatNumber(kpis.appointments)} />
        <StatCard label="Sold Deals" value={formatNumber(kpis.soldDeals)} />
        <StatCard label="Revenue" value={`$${formatNumber(kpis.revenue)}`} />
        <StatCard label="Conversion Rate" value={formatPercent(kpis.conversionRate)} />
        <StatCard label="Average Lead Score" value={scoreLabel(kpis.averageLeadScore)} />
        <StatCard label="Average Response Time" value={kpis.averageResponseTime} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-base font-semibold">Lead Funnel</h2>
        {funnel.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
            No funnel data yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {funnel.map((step, index) => {
              const prev = index === 0 ? null : funnel[index - 1]
              return (
                <div key={`${step.stage}-${index}`} className="flex w-full max-w-xl flex-col items-center">
                  <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{step.stage}</p>
                    <p className="text-xl font-semibold">{formatNumber(step.count)}</p>
                    {prev && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Conversion: {step.conversion || pct(step.count, prev.count)}
                      </p>
                    )}
                  </div>
                  {index < funnel.length - 1 && <div className="text-[var(--text-muted)]">↓</div>}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Lead Source</h2>
        <DataTable
          columns={[
            { key: 'source', label: 'Source' },
            { key: 'leads', label: 'Leads' },
            { key: 'qualified', label: 'Qualified' },
            { key: 'appointments', label: 'Appointments' },
            { key: 'sold', label: 'Sold' },
            {
              key: 'revenue',
              label: 'Revenue',
              render: (row) => `$${formatNumber(row.revenue)}`,
            },
          ]}
          rows={sources}
          pageSize={8}
          emptyTitle="No lead sources yet."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Dealership Performance</h2>
        <DataTable
          columns={[
            { key: 'dealership', label: 'Dealership', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            { key: 'qualified', label: 'Qualified', sortable: true },
            { key: 'routed', label: 'Routed', sortable: true },
            { key: 'appointments', label: 'Appointments', sortable: true },
            { key: 'sold', label: 'Sold', sortable: true },
            {
              key: 'revenue',
              label: 'Revenue',
              sortable: true,
              render: (row) => `$${formatNumber(row.revenue)}`,
            },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (row) => formatPercent(row.conversionRate),
            },
          ]}
          rows={dealershipRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(key) => {
            if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
            else {
              setSortKey(key)
              setSortDir('desc')
            }
          }}
          pageSize={8}
          emptyTitle="No dealership performance yet."
        />
      </Card>

      <h2 className="mb-3 mt-6 text-base font-semibold">AI Performance</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="AI Conversations" value={formatNumber(ai.aiConversations)} />
        <StatCard label="Qualification Rate" value={formatPercent(ai.qualificationRate)} />
        <StatCard label="AI Response Time" value={ai.aiResponseTime} />
        <StatCard label="AI Assisted Leads" value={formatNumber(ai.aiAssistedLeads)} />
        <StatCard label="AI Appointments" value={formatNumber(ai.aiAppointments)} />
        <StatCard label="AI Conversion" value={formatPercent(ai.aiConversion)} />
      </div>

      <h2 className="mb-3 mt-6 text-base font-semibold">Sales Performance</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Active Salespeople" value={formatNumber(sales.activeSalespeople)} />
        <StatCard label="Average Response Time" value={sales.averageResponseTime} />
        <StatCard label="Lead Acceptance Rate" value={formatPercent(sales.leadAcceptanceRate)} />
        <StatCard label="Appointment Rate" value={formatPercent(sales.appointmentRate)} />
        <StatCard label="Sold Rate" value={formatPercent(sales.soldRate)} />
      </div>
      <Card className="mt-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Salesperson' },
            { key: 'dealership', label: 'Dealership' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'appointments', label: 'Appointments' },
            { key: 'sold', label: 'Sold' },
            { key: 'responseTime', label: 'Response Time' },
            {
              key: 'acceptanceRate',
              label: 'Acceptance Rate',
              render: (row) => formatPercent(row.acceptanceRate),
            },
          ]}
          rows={salespeople}
          pageSize={8}
          emptyTitle="No salesperson performance yet."
        />
      </Card>

      <h2 className="mb-3 mt-6 text-base font-semibold">Marketing Performance</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Reach" value={formatNumber(marketing.reach)} />
        <StatCard label="Engagement" value={formatPercent(marketing.engagement)} />
        <StatCard label="Leads" value={formatNumber(marketing.leads)} />
        <StatCard label="Appointments" value={formatNumber(marketing.appointments)} />
        <StatCard label="Sold" value={formatNumber(marketing.sold)} />
        <StatCard label="Revenue" value={`$${formatNumber(marketing.revenue)}`} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm font-semibold">By Platform</h3>
          {marketing.byPlatform.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No platform data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketing.byPlatform}>
                  <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#0f2b46" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">By Campaign</h3>
          {marketing.byCampaign.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No campaign data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {marketing.byCampaign.map((c) => (
                <li key={c.name} className="flex justify-between gap-2 border-b border-[var(--border-default)] pb-2">
                  <span>{c.name}</span>
                  <span className="font-medium">{c.leads} leads</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">By Dealership</h3>
          {marketing.byDealership.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No dealership marketing data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {marketing.byDealership.map((d) => (
                <li key={d.name} className="flex justify-between gap-2 border-b border-[var(--border-default)] pb-2">
                  <span>{d.name}</span>
                  <span className="font-medium">${formatNumber(d.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-base font-semibold">Attribution Journey</h2>
        {journey.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
            No attribution journey data yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {journey.map((step, index) => (
              <div key={`${step.stage}-${index}`} className="flex w-full max-w-xl flex-col items-center">
                <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">{step.stage}</p>
                  <p className="text-lg font-semibold">
                    {step.isCurrency ? `$${formatNumber(step.count)}` : formatNumber(step.count)}
                  </p>
                </div>
                {index < journey.length - 1 && <div className="text-[var(--text-muted)]">↓</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
