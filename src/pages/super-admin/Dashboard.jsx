import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Target,
  Route,
  CalendarCheck,
  Handshake,
  Percent,
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
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import FingerprintViewer from '../../components/dashboard/FingerprintViewer'
import DispatchMap from '../../components/dashboard/DispatchMap'
import BdcSmartInbox from '../../components/dashboard/BdcSmartInbox'
import SocialEnginePanel from '../../components/dashboard/SocialEnginePanel'
import CrmReadOnlySyncCard from '../../components/dashboard/CrmReadOnlySyncCard'
import UnderwaterRescueSection from '../../components/dashboard/UnderwaterRescueSection'
import { formatNumber, formatPercent } from '../../utils/table'
import commandCenterService from '../../services/mock/commandCenterService'
import nuclearModeService from '../../services/mock/nuclearModeService'
import dealHandoffService from '../../services/mock/dealHandoffService'
import { LEAD_STATUSES, LEAD_TIERS } from '../../data/leads'

const KPI_ICONS = {
  totalLeads: Users,
  qualifiedLeads: Target,
  routedLeads: Route,
  appointments: CalendarCheck,
  sold: Handshake,
  conversionRate: Percent,
}

function statusLabel(status) {
  if (!status) return '—'
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('all')
  const [status, setStatus] = useState('all')
  const [rooftop, setRooftop] = useState('all')
  const [page, setPage] = useState(1)
  const [fingerprintLead, setFingerprintLead] = useState(null)
  const [nuclear, setNuclear] = useState(null)
  const [handoffs, setHandoffs] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [overview, nuclearMode, handoffRows] = await Promise.all([
        commandCenterService.getCommandCenter(),
        nuclearModeService.getNuclearMode(),
        dealHandoffService.getDealHandoffs(),
      ])
      setData(overview)
      setNuclear(nuclearMode)
      setHandoffs(handoffRows)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const rooftops = useMemo(
    () => [...new Set((data?.leads || []).map((item) => item.dealership))].sort(),
    [data],
  )

  const filteredLeads = useMemo(() => {
    if (!data?.leads) return []
    let rows = data.leads
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (row) =>
          row.id.toLowerCase().includes(q) ||
          row.customerName.toLowerCase().includes(q) ||
          row.vehicle.toLowerCase().includes(q) ||
          String(row.salesperson || '').toLowerCase().includes(q),
      )
    }
    if (tier !== 'all') rows = rows.filter((row) => row.tier === tier)
    if (status !== 'all') rows = rows.filter((row) => row.status === status)
    if (rooftop !== 'all') rows = rows.filter((row) => row.dealership === rooftop)
    return rows
  }, [data, search, tier, status, rooftop])

  const openFingerprint = (leadOrId) => {
    if (!data?.leads) return
    const lead =
      typeof leadOrId === 'string'
        ? data.leads.find((item) => item.id === leadOrId)
        : leadOrId
    if (lead) setFingerprintLead(lead)
  }

  const leadColumns = [
    {
      key: 'id',
      label: 'Lead ID',
      render: (row) => (
        <Link
          to={`/super-admin/leads/${row.id}`}
          className="font-medium text-[var(--brand-accent)] hover:underline"
        >
          {row.id}
        </Link>
      ),
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'source', label: 'Source' },
    { key: 'dealership', label: 'Rooftop' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'score', label: 'Score' },
    {
      key: 'tier',
      label: 'Tier',
      render: (row) => <StatusBadge status={`Tier ${row.tier}`} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={statusLabel(row.status)} />,
    },
    {
      key: 'salesperson',
      label: 'Salesperson',
      render: (row) => row.salesperson || 'Unassigned',
    },
    { key: 'lastActivity', label: 'Last Activity' },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Link to={`/super-admin/leads/${row.id}`}>
            <Button size="sm" variant="ghost">
              View
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => openFingerprint(row)}>
            Open Fingerprint
          </Button>
        </div>
      ),
    },
  ]

  const rooftopColumns = [
    { key: 'dealership', label: 'Rooftop' },
    {
      key: 'leads',
      label: 'Leads',
      render: (row) => formatNumber(row.leads),
    },
    {
      key: 'qualified',
      label: 'Qualified',
      render: (row) => formatNumber(row.qualified),
    },
    {
      key: 'routed',
      label: 'Routed',
      render: (row) => formatNumber(row.routed),
    },
    {
      key: 'appointments',
      label: 'Appointments',
      render: (row) => formatNumber(row.appointments || 0),
    },
    {
      key: 'sold',
      label: 'Sold',
      render: (row) => formatNumber(row.sold || row.closed),
    },
    {
      key: 'conversionRate',
      label: 'Conversion',
      render: (row) => formatPercent(row.conversionRate),
    },
  ]

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} label="Loading command center" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Model 31 Command Center"
        description="Unified lead operations, dispatch, fingerprints, BDC inbox, rooftop performance, social engine, CRM sync, and underwater rescue."
        actions={
          <Link to="/super-admin/analytics">
            <Button variant="secondary" size="sm">
              <Activity size={14} />
              Platform Analytics
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {data.kpis.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            icon={KPI_ICONS[item.key]}
            hint={item.hint}
            trend={item.trend}
            value={
              item.key === 'conversionRate'
                ? formatPercent(item.value)
                : formatNumber(item.value)
            }
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold">Nuclear Mode</h2>
          <div className="mt-3 flex items-center justify-between">
            <StatusBadge status={nuclear?.status || 'OFF'} />
            <Link to="/super-admin/system-controls">
              <Button size="sm" variant="secondary">
                Controls
              </Button>
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Active Deals" value={formatNumber(nuclear?.activeDeals)} />
            <StatCard label="Qualified Buyers" value={formatNumber(nuclear?.qualifiedBuyers)} />
            <StatCard label="Manager Handoffs" value={formatNumber(nuclear?.managerHandoffs)} />
            <StatCard label="Deals Ready" value={formatNumber(nuclear?.dealsReady)} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Buyer Genome</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Open a lead to view urgency, hesitation and reply strategy.
          </p>
          <Link to="/super-admin/leads/LEAD-2048" className="mt-4 inline-block">
            <Button size="sm">View Sample Genome</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Deals Ready</h2>
          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(handoffs.filter((h) => h.dealStatus === 'DEAL READY').length)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Manager review queue</p>
          <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
            <Button size="sm">Manager Handoffs</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Manager Handoffs</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {formatNumber(handoffs.length)} structured deals in mock review.
          </p>
          <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">
              Open Handoffs
            </Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Negotiation Controls</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manager-defined price, payment and trade limits.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/super-admin/negotiation-control">
              <Button size="sm">Negotiation Control</Button>
            </Link>
            <Link to="/super-admin/negotiation-templates">
              <Button size="sm" variant="secondary">
                Templates
              </Button>
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Buy Online Readiness</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {nuclear?.enabled
              ? `${handoffs.filter((h) => h.dealStatus === 'DEAL READY' && h.intent === 'HIGH').length} deals meet mock Buy Online conditions.`
              : 'Buy Online unavailable until Nuclear Mode is ON and a deal is ready.'}
          </p>
          <Link to="/super-admin/deal-handoffs/dh_001" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">
              Review Ready Deal
            </Button>
          </Link>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Unified Lead Grid</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Search and filter across all Model 31 and dealership leads.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search lead, customer, vehicle..."
            />
            <Select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All tiers' },
                ...LEAD_TIERS.map((item) => ({ value: item, label: `Tier ${item}` })),
              ]}
            />
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All statuses' },
                ...LEAD_STATUSES.map((item) => ({
                  value: item,
                  label: statusLabel(item),
                })),
              ]}
            />
            <Select
              value={rooftop}
              onChange={(e) => {
                setRooftop(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All rooftops' },
                ...rooftops.map((item) => ({ value: item, label: item })),
              ]}
            />
          </div>
        </div>
        <DataTable
          columns={leadColumns}
          rows={filteredLeads}
          page={page}
          onPageChange={setPage}
          pageSize={8}
          emptyTitle="No leads match these filters."
        />
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DispatchMap map={data.dispatchMap} />
        </div>
        <BdcSmartInbox rows={data.inbox} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold">Rooftop Performance Board</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Dealership performance across the platform.
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.rooftops}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ed" />
                <XAxis dataKey="dealership" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={56} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="qualified" name="Qualified" stroke="#1a6b8a" strokeWidth={2} />
                <Line type="monotone" dataKey="sold" name="Sold" stroke="#1a7a4c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <DataTable columns={rooftopColumns} rows={data.rooftops} pageSize={5} />
          </div>
        </Card>

        <div className="space-y-5">
          <SocialEnginePanel rows={data.socialEngineRows} />
          <CrmReadOnlySyncCard data={data.crmReadOnlySync} />
        </div>
      </div>

      <UnderwaterRescueSection
        data={data.underwaterRescue}
        onOpenFingerprint={openFingerprint}
      />

      <FingerprintViewer
        open={Boolean(fingerprintLead)}
        lead={fingerprintLead}
        onClose={() => setFingerprintLead(null)}
      />
    </div>
  )
}
