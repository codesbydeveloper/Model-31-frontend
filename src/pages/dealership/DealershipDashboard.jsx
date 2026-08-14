import { useCallback, useEffect, useState } from 'react'
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
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import platformAnalyticsService from '../../services/mock/platformAnalyticsService'

export default function DealershipDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await platformAnalyticsService.getDealershipDashboard())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealership Dashboard"
        description="Dealership operations overview for leads, appointments and sales."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Leads Today" value={formatNumber(data.leadsToday)} />
        <StatCard label="Qualified Leads" value={formatNumber(data.qualifiedLeads)} />
        <StatCard label="Assigned Leads" value={formatNumber(data.assignedLeads)} />
        <StatCard label="Appointments" value={formatNumber(data.appointments)} />
        <StatCard label="Sold Deals" value={formatNumber(data.soldDeals)} />
        <StatCard label="Revenue" value={`$${formatNumber(data.revenue)}`} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Lead Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.leadTrend}>
                <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#0f2b46" strokeWidth={2} />
                <Line type="monotone" dataKey="qualified" stroke="#1a7a4c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Lead Sources</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.leadSources}>
                <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1a6b8a" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-base font-semibold">Sales Funnel</h2>
        <div className="flex flex-col items-center gap-1">
          {data.salesFunnel.map((step, index) => (
            <div key={step.stage} className="flex w-full max-w-md flex-col items-center">
              <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-center">
                <p className="text-sm text-[var(--text-secondary)]">{step.stage}</p>
                <p className="text-xl font-semibold">{formatNumber(step.count)}</p>
              </div>
              {index < data.salesFunnel.length - 1 && (
                <div className="text-[var(--text-muted)]">↓</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
