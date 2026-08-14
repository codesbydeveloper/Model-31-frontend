import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  MapPinned,
  Users,
  Target,
  Route,
  Handshake,
  Percent,
  UserCheck,
  Bot,
  Sparkles,
  Cable,
  Share2,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import FunnelVisual from '../../components/common/FunnelVisual'
import Toggle from '../../components/common/Toggle'
import ConfirmModal from '../../components/common/ConfirmModal'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber, formatPercent, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import analyticsService from '../../services/mock/analyticsService'

const STAT_META = [
  { key: 'totalDealerships', label: 'Total Dealerships', icon: Building2 },
  { key: 'activeCities', label: 'Active Cities', icon: MapPinned },
  { key: 'totalLeads', label: 'Total Leads', icon: Users },
  { key: 'qualifiedLeads', label: 'Qualified Leads', icon: Target },
  { key: 'routedLeads', label: 'Routed Leads', icon: Route },
  { key: 'closedDeals', label: 'Closed Deals', icon: Handshake },
  { key: 'conversionRate', label: 'Conversion Rate', icon: Percent },
  { key: 'activeSalespeople', label: 'Active Salespeople', icon: UserCheck },
]

const SYSTEM_TOGGLES = [
  { key: 'aiConversation', label: 'AI Conversation' },
  { key: 'leadQualification', label: 'Lead Qualification' },
  { key: 'leadDispatch', label: 'Lead Dispatch' },
  { key: 'crmSync', label: 'CRM Sync' },
  { key: 'socialPosting', label: 'Social Posting' },
  { key: 'systemAutonomy', label: 'System Autonomy' },
]

const ACTIVITY_ICONS = {
  dealership: Building2,
  lead: Target,
  dispatch: Route,
  accept: UserCheck,
  crm: Cable,
  content: Sparkles,
  user: Users,
  default: Activity,
}

export default function SuperAdminDashboard() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('leads')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pendingToggle, setPendingToggle] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const overview = await analyticsService.getDashboardOverview()
      setData(overview)
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

  const performanceRows = useMemo(() => {
    if (!data) return []
    let rows = data.performance
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.dealership.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter)
    }
    return sortBy(rows, sortKey, sortDir)
  }, [data, search, statusFilter, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const requestToggle = (key, nextValue) => {
    if (nextValue) {
      applyToggle(key, true)
      return
    }
    const meta = SYSTEM_TOGGLES.find((t) => t.key === key)
    setPendingToggle({ key, label: meta?.label || key })
  }

  const applyToggle = async (key, value) => {
    setToggleLoading(true)
    try {
      const next = await analyticsService.updateSystemToggle(key, value)
      setData((prev) => ({ ...prev, systemStatus: next }))
      showToast(
        value
          ? `${SYSTEM_TOGGLES.find((t) => t.key === key)?.label} enabled.`
          : `${SYSTEM_TOGGLES.find((t) => t.key === key)?.label} disabled.`,
      )
    } finally {
      setToggleLoading(false)
      setPendingToggle(null)
    }
  }

  const columns = [
    { key: 'dealership', label: 'Dealership', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    {
      key: 'leads',
      label: 'Leads',
      sortable: true,
      render: (row) => formatNumber(row.leads),
    },
    {
      key: 'qualified',
      label: 'Qualified',
      sortable: true,
      render: (row) => formatNumber(row.qualified),
    },
    {
      key: 'routed',
      label: 'Routed',
      sortable: true,
      render: (row) => formatNumber(row.routed),
    },
    {
      key: 'closed',
      label: 'Closed',
      sortable: true,
      render: (row) => formatNumber(row.closed),
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      sortable: true,
      render: (row) => formatPercent(row.conversionRate),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} label="Loading dashboard" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform overview and administrative controls."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_META.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            icon={icon}
            value={
              key === 'conversionRate'
                ? formatPercent(data.stats[key])
                : formatNumber(data.stats[key])
            }
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-base font-semibold">Lead Performance</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Leads over the last 30 days.
          </p>
          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ed" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Leads" stroke="#0f2b46" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="qualified" name="Qualified" stroke="#1a6b8a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="routed" name="Routed" stroke="#1a7a4c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="closed" name="Closed" stroke="#9a6b1a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Lead Conversion Funnel</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Stage progression across the platform.
          </p>
          <div className="mt-5">
            <FunnelVisual stages={data.funnel} />
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold">Lead Source Analytics</h2>
          <div className="mt-4 space-y-3">
            {data.sources.map((source) => (
              <div key={source.source}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{source.source}</span>
                  <span className="text-[var(--text-secondary)]">
                    {formatNumber(source.count)} · {source.percentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-accent)]"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Bot size={18} className="text-[var(--brand-accent)]" />
            <h2 className="text-base font-semibold">System Status</h2>
          </div>
          <div className="space-y-4">
            {SYSTEM_TOGGLES.map((item) => (
              <Toggle
                key={item.key}
                label={item.label}
                checked={Boolean(data.systemStatus[item.key])}
                onChange={(next) => requestToggle(item.key, next)}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Dealership Performance</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Search, filter, and sort dealership metrics.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search dealership or city"
              className="sm:w-56"
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              className="sm:w-40"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={performanceRows}
          rowKey="dealership"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          onPageChange={setPage}
          pageSize={5}
        />
      </Card>

      <Card className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <Share2 size={18} className="text-[var(--brand-accent)]" />
          <h2 className="text-base font-semibold">Recent Activity</h2>
        </div>
        <ul className="space-y-3">
          {data.activity.map((item) => {
            const Icon = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.default
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-3"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--brand-accent)]">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {item.actor} · {item.time}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <ConfirmModal
        open={Boolean(pendingToggle)}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => applyToggle(pendingToggle.key, false)}
        title="Disable system control"
        message={`Are you sure you want to disable ${pendingToggle?.label}?`}
        confirmLabel="Disable"
        danger
        loading={toggleLoading}
      />
    </div>
  )
}
