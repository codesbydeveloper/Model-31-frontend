import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import Toggle from '../../components/common/Toggle'
import FingerprintViewer from '../../components/dashboard/FingerprintViewer'
import DispatchMap from '../../components/dashboard/DispatchMap'
import BdcSmartInbox from '../../components/dashboard/BdcSmartInbox'
import SocialEnginePanel from '../../components/dashboard/SocialEnginePanel'
import CrmReadOnlySyncCard from '../../components/dashboard/CrmReadOnlySyncCard'
import UnderwaterRescueSection from '../../components/dashboard/UnderwaterRescueSection'
import OEMReporting from '../../components/oem/OEMReporting'
import { formatNumber, formatPercent } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import {
  getDashboardKpis,
  getNuclearMode,
  setNuclearMode,
  getBuyerGenome,
  getDealsReady,
  getManagerHandoffs,
  getNegotiationControls,
  getBuyOnlineReadiness,
  getDashboardLeads,
  getDashboardLead,
  getFingerprint,
  getDispatchMap,
  getSmartInbox,
  getRooftopPerformance,
  getActivityFeed,
  getSocialEngine,
  getLeadWorkflow,
  getCrmSync,
  getOemReporting,
  exportOemReporting,
  getUnderwaterRescue,
  getUnderwaterRescueActivity,
  getRescueFingerprint,
} from '../../services/api/superAdminDashboardService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

const KPI_ICONS = {
  totalLeads: Users,
  qualifiedLeads: Target,
  routedLeads: Route,
  appointments: CalendarCheck,
  sold: Handshake,
  conversionRate: Percent,
}

const NEGOTIATION_LINKS = {
  'Negotiation Control': '/super-admin/negotiation-control',
  Templates: '/super-admin/negotiation-templates',
}

function settledValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback
}

export default function SuperAdminDashboard() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState([])
  const [nuclear, setNuclear] = useState(null)
  const [nuclearBusy, setNuclearBusy] = useState(false)
  const [genomes, setGenomes] = useState([])
  const [dealsReady, setDealsReady] = useState([])
  const [handoffs, setHandoffs] = useState({ summary: '', count: 0, items: [] })
  const [negotiation, setNegotiation] = useState({ description: '', items: [], actions: [] })
  const [buyOnline, setBuyOnline] = useState(null)
  const [dispatchMap, setDispatchMap] = useState(null)
  const [inbox, setInbox] = useState([])
  const [activityFeed, setActivityFeed] = useState([])
  const [rooftops, setRooftops] = useState({ chart: [], table: [] })
  const [social, setSocial] = useState({ subtitle: '', rows: [] })
  const [workflow, setWorkflow] = useState(null)
  const [crmSync, setCrmSync] = useState(null)
  const [oem, setOem] = useState(null)
  const [rescue, setRescue] = useState(null)
  const [leads, setLeads] = useState([])
  const [leadTotal, setLeadTotal] = useState(0)
  const [leadTiers, setLeadTiers] = useState(['All tiers'])
  const [leadStatuses, setLeadStatuses] = useState(['All statuses'])
  const [leadRooftops, setLeadRooftops] = useState(['All rooftops'])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tier, setTier] = useState('All tiers')
  const [status, setStatus] = useState('All statuses')
  const [rooftop, setRooftop] = useState('All rooftops')
  const [page, setPage] = useState(1)
  const [tableLoading, setTableLoading] = useState(true)
  const [fingerprint, setFingerprint] = useState(null)
  const [fingerprintOpen, setFingerprintOpen] = useState(false)
  const [fingerprintLoading, setFingerprintLoading] = useState(false)

  const loadOverview = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled([
      getDashboardKpis(),
      getNuclearMode(),
      getBuyerGenome(),
      getDealsReady(),
      getManagerHandoffs(),
      getNegotiationControls(),
      getBuyOnlineReadiness(),
      getDispatchMap(),
      getSmartInbox(),
      getRooftopPerformance(),
      getActivityFeed(),
      getSocialEngine(),
      getLeadWorkflow(),
      getCrmSync(),
      getOemReporting('All Brands'),
      getUnderwaterRescue(),
      getUnderwaterRescueActivity({ page: 1, limit: 10 }),
    ])
    const failed = results.filter((item) => item.status === 'rejected')
    if (failed.length) {
      showToast(failed[0].reason?.message || 'Unable to load command center.', 'error')
    }
    setKpis(settledValue(results[0], []))
    setNuclear(settledValue(results[1], null))
    setGenomes(settledValue(results[2], []))
    setDealsReady(settledValue(results[3], []))
    setHandoffs(settledValue(results[4], { summary: '', count: 0, items: [] }))
    setNegotiation(settledValue(results[5], { description: '', items: [], actions: [] }))
    setBuyOnline(settledValue(results[6], null))
    setDispatchMap(settledValue(results[7], null))
    setInbox(settledValue(results[8], []))
    setRooftops(settledValue(results[9], { chart: [], table: [] }))
    setActivityFeed(settledValue(results[10], []))
    setSocial(settledValue(results[11], { subtitle: '', rows: [] }))
    setWorkflow(settledValue(results[12], null))
    setCrmSync(settledValue(results[13], null))
    setOem(settledValue(results[14], null))
    const rescueData = settledValue(results[15], null)
    const rescueActivity = settledValue(results[16], { items: [] })
    setRescue(
      rescueData
        ? { ...rescueData, activity: rescueActivity.items || [] }
        : { activity: rescueActivity.items || [] },
    )
    setLoading(false)
  }, [showToast])

  const loadLeads = useCallback(async () => {
    setTableLoading(true)
    try {
      const result = await getDashboardLeads({
        search: debouncedSearch,
        tier,
        status,
        rooftop,
        page,
        limit: PAGE_SIZE,
      })
      setLeads(result.items)
      setLeadTotal(result.total)
      if (result.tiers?.length) setLeadTiers(result.tiers)
      if (result.statuses?.length) setLeadStatuses(result.statuses)
      if (result.rooftops?.length) setLeadRooftops(result.rooftops)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setLeads([])
      setLeadTotal(0)
      showToast(err.message || 'Unable to load leads.', 'error')
    } finally {
      setTableLoading(false)
    }
  }, [debouncedSearch, tier, status, rooftop, page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    const t = window.setTimeout(() => void loadOverview(), 0)
    return () => window.clearTimeout(t)
  }, [loadOverview])

  useEffect(() => {
    const t = window.setTimeout(() => void loadLeads(), 0)
    return () => window.clearTimeout(t)
  }, [loadLeads])

  const openFingerprint = async (leadId) => {
    if (!leadId) return
    setFingerprintOpen(true)
    setFingerprint(null)
    setFingerprintLoading(true)
    try {
      const data = await getFingerprint(leadId)
      setFingerprint(data)
    } catch (err) {
      setFingerprintOpen(false)
      showToast(err.message || 'Unable to load fingerprint.', 'error')
    } finally {
      setFingerprintLoading(false)
    }
  }

  const openRescueFingerprint = async (row) => {
    if (!row?.id) return
    setFingerprintOpen(true)
    setFingerprint(null)
    setFingerprintLoading(true)
    try {
      const data = await getRescueFingerprint(row.id)
      setFingerprint(data)
    } catch (err) {
      setFingerprintOpen(false)
      showToast(err.message || 'Unable to load fingerprint.', 'error')
    } finally {
      setFingerprintLoading(false)
    }
  }

  const viewLead = async (id) => {
    try {
      await getDashboardLead(id)
    } catch (err) {
      showToast(err.message || 'Unable to load lead.', 'error')
    }
    navigate(`/super-admin/leads/${id}`)
  }

  const toggleNuclear = async (enabled) => {
    setNuclearBusy(true)
    try {
      const next = await setNuclearMode(enabled)
      setNuclear(next)
      try {
        setBuyOnline(await getBuyOnlineReadiness())
      } catch {
        /* keep existing buy-online card */
      }
      showToast(`Nuclear Mode ${next.status}.`)
    } catch (err) {
      showToast(err.message || 'Unable to update Nuclear Mode.', 'error')
    } finally {
      setNuclearBusy(false)
    }
  }

  const changeOemBrand = async (brand) => {
    try {
      setOem(await getOemReporting(brand))
    } catch (err) {
      showToast(err.message || 'Unable to load OEM reporting.', 'error')
    }
  }

  const exportOem = async (format) => {
    try {
      await exportOemReporting(format)
    } catch (err) {
      showToast(err.message || 'Unable to export OEM report.', 'error')
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} label="Loading command center" />
      </div>
    )
  }

  const sampleLead = genomes.find((item) => item.leadId)?.leadId || leads[0]?.id
  const readyDealHref = dealsReady[0]?.id?.startsWith('dh_')
    ? `/super-admin/deal-handoffs/${dealsReady[0].id}`
    : '/super-admin/deal-handoffs'

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
        {kpis.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            icon={KPI_ICONS[item.key]}
            hint={item.hint}
            trend={item.trend}
            value={
              item.key === 'conversionRate' || item.unit === '%'
                ? formatPercent(item.value)
                : formatNumber(item.value)
            }
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold">Nuclear Mode</h2>
          <div className="mt-3 flex items-center justify-between gap-3">
            <StatusBadge status={nuclear?.status || 'OFF'} />
            <div className="flex items-center gap-3">
              <Toggle
                id="nuclear-mode-toggle"
                checked={Boolean(nuclear?.enabled)}
                disabled={nuclearBusy}
                onChange={toggleNuclear}
              />
              <Link to="/super-admin/system-controls">
                <Button size="sm" variant="secondary">
                  Controls
                </Button>
              </Link>
            </div>
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
            High-intent buyers and the reply style Model 31 should use.
          </p>
          <ul className="mt-4 space-y-2">
            {genomes.map((item) => (
              <li key={item.id}>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{item.customerName}</p>
                    <StatusBadge status={item.intent} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Urgency {formatNumber(item.urgency)}% · Hesitation {formatNumber(item.hesitation)}%
                    {item.tone ? ` · ${item.tone}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {sampleLead ? (
            <Link to={`/super-admin/leads/${sampleLead}`} className="mt-4 inline-block">
              <Button size="sm">View Genome</Button>
            </Link>
          ) : (
            <Link to="/super-admin/leads" className="mt-4 inline-block">
              <Button size="sm">View Leads</Button>
            </Link>
          )}
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Deals Ready</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {formatNumber(dealsReady.length)} deals waiting on manager review.
          </p>
          <ul className="mt-4 space-y-2">
            {dealsReady.map((item) => (
              <li key={item.id}>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{item.customerName}</p>
                    <StatusBadge status={item.priority} />
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                    {item.vehicle} · {item.salesperson}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
            <Button size="sm">Manager Handoffs</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Manager Handoffs</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {handoffs.summary || `${formatNumber(handoffs.count)} structured deals in review.`}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {handoffs.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 border-b border-[var(--border-default)] pb-2 last:border-0 last:pb-0"
              >
                <span className="truncate font-medium">{item.customerName}</span>
                <StatusBadge status={item.dealStatus} />
              </li>
            ))}
          </ul>
          <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">
              Open Handoffs
            </Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Negotiation Controls</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {negotiation.description}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
            {negotiation.items.map((item) => (
              <li key={item.label} className="flex justify-between gap-2">
                <span>{item.label}</span>
                <span className="font-medium text-[var(--text-primary)]">{item.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {(negotiation.actions.length
              ? negotiation.actions
              : ['Negotiation Control', 'Templates']
            ).map((action) => (
              <Link key={action} to={NEGOTIATION_LINKS[action] || '/super-admin/negotiation-control'}>
                <Button
                  size="sm"
                  variant={action === 'Templates' ? 'secondary' : 'primary'}
                >
                  {action}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Buy Online Readiness</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {buyOnline?.description ||
              'Buy Online unavailable until Nuclear Mode is ON and a deal is ready.'}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex justify-between gap-2">
              <span>Nuclear Mode</span>
              <StatusBadge status={buyOnline?.nuclearMode || nuclear?.status || 'OFF'} />
            </li>
            <li className="flex justify-between gap-2">
              <span>Intent required</span>
              <span className="font-medium text-[var(--text-primary)]">
                {buyOnline?.intentRequired || 'HIGH'}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Deal status</span>
              <span className="font-medium text-[var(--text-primary)]">
                {buyOnline?.dealStatus || 'DEAL READY'}
              </span>
            </li>
          </ul>
          <Link to={readyDealHref} className="mt-4 inline-block">
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead, customer, vehicle..."
            />
            <Select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value)
                setPage(1)
              }}
              options={leadTiers.map((item) => ({ value: item, label: item }))}
            />
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              options={leadStatuses.map((item) => ({ value: item, label: item }))}
            />
            <Select
              value={rooftop}
              onChange={(e) => {
                setRooftop(e.target.value)
                setPage(1)
              }}
              options={leadRooftops.map((item) => ({ value: item, label: item }))}
            />
          </div>
        </div>
        {tableLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Lead ID',
                render: (row) => (
                  <button
                    type="button"
                    className="font-medium text-[var(--brand-accent)] hover:underline"
                    onClick={() => void viewLead(row.id)}
                  >
                    {row.id}
                  </button>
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
                render: (row) => <StatusBadge status={row.tier} />,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
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
                    <Button size="sm" variant="ghost" onClick={() => void viewLead(row.id)}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void openFingerprint(row.id)}
                    >
                      Open Fingerprint
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={leads}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={leadTotal}
            showPagination
            emptyTitle="No leads match these filters."
          />
        )}
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3 xl:items-stretch">
        <div className="xl:col-span-2">
          <DispatchMap map={dispatchMap} />
        </div>
        <div className="flex flex-col gap-5">
          <BdcSmartInbox rows={inbox} />
          <Card className="flex h-full flex-col">
            <h2 className="text-base font-semibold">Activity Feed</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Latest rooftop and conversation activity.
            </p>
            <ul className="mt-4 space-y-2">
              {activityFeed.length === 0 ? (
                <li className="text-sm text-[var(--text-secondary)]">No recent activity.</li>
              ) : (
                activityFeed.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{item.name}</p>
                      {item.priority ? <StatusBadge status={item.priority} /> : null}
                    </div>
                    {item.message ? (
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.message}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {[item.tier, item.score ? `Score ${item.score}` : '', item.salesperson, item.time]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3 xl:items-stretch">
        <Card className="xl:col-span-2">
          <h2 className="text-base font-semibold">Rooftop Performance Board</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Dealership performance across the platform.
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rooftops.chart}>
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
            <DataTable
              columns={[
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
                  render: (row) => formatNumber(row.sold),
                },
                {
                  key: 'conversionRate',
                  label: 'Conversion',
                  render: (row) => formatPercent(row.conversionRate),
                },
              ]}
              rows={rooftops.table}
              pageSize={5}
            />
          </div>
        </Card>
        <SocialEnginePanel
          rows={social.rows}
          subtitle={social.subtitle}
          workflow={workflow}
        />
      </div>

      <div className="mt-5">
        <CrmReadOnlySyncCard data={crmSync} />
      </div>

      <div className="mt-5">
        <OEMReporting
          report={oem}
          onBrandChange={(brand) => void changeOemBrand(brand)}
          onExport={exportOem}
        />
      </div>

      <UnderwaterRescueSection
        data={rescue}
        onOpenFingerprint={(row) => void openRescueFingerprint(row)}
      />

      <FingerprintViewer
        open={fingerprintOpen}
        fingerprint={fingerprint}
        loading={fingerprintLoading}
        onClose={() => {
          setFingerprintOpen(false)
          setFingerprint(null)
        }}
      />
    </div>
  )
}
