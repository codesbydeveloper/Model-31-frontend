import { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
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
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import bdcSlaService from '../../services/api/bdcSlaService'

export default function BdcSlaPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await bdcSlaService.getBdcSla())
    } catch (err) {
      setData(null)
      showToast(err.message || 'Unable to load SLA data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumbs />
        <PageHeader
          title="SLA Monitoring"
          description="Track response times and service-level compliance for dispatched leads."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="SLA Monitoring"
        description="Track response times and service-level compliance for dispatched leads."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Average Response Time" value={data.overview.averageResponseTime} />
        <StatCard label="Leads Within SLA" value={formatNumber(data.overview.withinSla)} />
        <StatCard label="Leads Near SLA" value={formatNumber(data.overview.nearSla)} />
        <StatCard label="Leads Outside SLA" value={formatNumber(data.overview.outsideSla)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">ON TIME</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-ready)]">
            {data.overview.withinSla}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">WARNING</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-pending)]">
            {data.overview.nearSla}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">BREACHED</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--status-error)]">
            {data.overview.outsideSla}
          </p>
        </Card>
      </div>

      {data.chart.length > 0 && (
        <Card className="mt-5">
          <h2 className="text-base font-semibold">SLA Performance</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ed" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTime" name="On Time" fill="#1a7a4c" />
                <Bar dataKey="warning" name="Warning" fill="#9a6b1a" />
                <Bar dataKey="breached" name="Breached" fill="#b42318" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="mt-5">
        <DataTable
          columns={[
            {
              key: 'lead',
              label: 'Lead',
              render: (row) => (
                <div>
                  <p className="font-medium">{row.leadId}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{row.customerName}</p>
                </div>
              ),
            },
            { key: 'salesperson', label: 'Salesperson' },
            { key: 'assignedAt', label: 'Assigned At' },
            { key: 'acceptedAt', label: 'Accepted At' },
            { key: 'responseTime', label: 'Response Time' },
            {
              key: 'slaStatus',
              label: 'SLA Status',
              render: (row) => <StatusBadge status={row.slaStatus} />,
            },
          ]}
          rows={data.rows}
          pageSize={8}
          emptyTitle="No SLA rows yet."
        />
      </Card>
    </div>
  )
}
