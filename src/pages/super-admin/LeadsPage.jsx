import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Sparkles,
  Target,
  Route,
  Handshake,
  Inbox,
  MoreHorizontal,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import Dropdown from '../../components/common/Dropdown'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import leadService from '../../services/api/leadService'
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TIERS } from '../../data/leads'
import { PIPELINE_TYPES } from '../../utils/pipeline'
import PipelineBadge from '../../components/common/PipelineBadge'
import AssignSalespersonModal from './leads/AssignSalespersonModal'
import ChangeStatusModal from './leads/ChangeStatusModal'
import AddNoteModal from './leads/AddNoteModal'
import EditLeadModal from './leads/EditLeadModal'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const STAT_CARDS = [
  { key: 'totalLeads', label: 'Total Leads', icon: Users },
  { key: 'new', label: 'New', icon: Inbox },
  { key: 'qualifying', label: 'Qualifying', icon: Sparkles },
  { key: 'qualified', label: 'Qualified', icon: Target },
  { key: 'routed', label: 'Routed', icon: Route },
  { key: 'closed', label: 'Closed', icon: Handshake },
]

const EMPTY_FILTERS = {
  status: 'all',
  tier: 'all',
  dealership: 'all',
  city: 'all',
  salesperson: 'all',
  source: 'all',
  pipeline: 'all',
  scoreRange: 'all',
}

function matchesScoreRange(score, range) {
  if (range === 'all') return true
  if (range === '80-100') return score >= 80
  if (range === '40-79') return score >= 40 && score <= 79
  if (range === '0-39') return score <= 39
  return true
}

export default function LeadsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [activeLead, setActiveLead] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await leadService.getLeads({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      })
      setRows(result.items)
      setStats(result.stats)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setStats(null)
      setTotalItems(0)
      showToast(err.message || 'Unable to load leads.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const dealerships = useMemo(
    () => [...new Set(rows.map((r) => r.dealership))].sort(),
    [rows],
  )
  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city))].sort(),
    [rows],
  )
  const salespeople = useMemo(
    () =>
      [...new Set(rows.map((r) => r.salesperson).filter(Boolean))].sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    let list = rows
    if (filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status)
    }
    if (filters.tier !== 'all') {
      list = list.filter((r) => r.tier === filters.tier)
    }
    if (filters.dealership !== 'all') {
      list = list.filter((r) => r.dealership === filters.dealership)
    }
    if (filters.city !== 'all') {
      list = list.filter((r) => r.city === filters.city)
    }
    if (filters.salesperson !== 'all') {
      list = list.filter((r) => r.salesperson === filters.salesperson)
    }
    if (filters.source !== 'all') {
      list = list.filter((r) => r.source === filters.source)
    }
    if (filters.pipeline !== 'all') {
      list = list.filter((r) => r.pipelineType === filters.pipeline)
    }
    list = list.filter((r) => matchesScoreRange(r.score, filters.scoreRange))

    const keyMap = {
      score: 'score',
      createdAt: 'createdAt',
      budget: 'budgetValue',
      status: 'status',
    }
    return sortBy(list, keyMap[sortKey] || sortKey, sortDir)
  }, [rows, filters, sortKey, sortDir])

  const clearFilters = () => {
    setSearch('')
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const openAction = (lead, action) => {
    setActiveLead(lead)
    if (action === 'view') navigate(`/super-admin/leads/${lead.id}`)
    if (action === 'edit') setEditOpen(true)
    if (action === 'assign') setAssignOpen(true)
    if (action === 'status') setStatusOpen(true)
    if (action === 'note') setNoteOpen(true)
  }

  const columns = [
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
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'budget', label: 'Budget' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'location', label: 'Location' },
    { key: 'financing', label: 'Financing' },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold">{row.score}</p>
          <p className="text-xs text-[var(--text-secondary)]">Tier {row.tier}</p>
        </div>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (row) => <StatusBadge status={`Tier ${row.tier}`} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'dealership', label: 'Dealership' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'source', label: 'Source' },
    {
      key: 'pipelineType',
      label: 'Pipeline',
      render: (row) => <PipelineBadge pipelineType={row.pipelineType} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (row) => row.createdLabel,
    },
    {
      key: 'actions',
      label: 'Actions',
      cellClassName: 'relative overflow-visible',
      render: (row) => (
        <Dropdown
          label={<MoreHorizontal size={16} />}
          buttonClassName="h-8 w-8 px-0"
          aria-label="Lead actions"
          items={[
            { label: 'View Lead', value: 'view' },
            { label: 'Edit Lead', value: 'edit' },
            { label: 'Assign Salesperson', value: 'assign' },
            { label: 'Change Status', value: 'status' },
            { label: 'Add Note', value: 'note' },
          ]}
          onSelect={(item) => openAction(row, item.value)}
        />
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Leads"
        description="Manage, qualify and monitor customer leads across the Model 31 platform."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            icon={icon}
            value={formatNumber(stats?.[key] || 0)}
          />
        ))}
      </div>

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, ID, vehicle…"
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
              ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={filters.tier}
            onChange={(e) => {
              setFilters((f) => ({ ...f, tier: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All tiers' },
              ...LEAD_TIERS.map((t) => ({ value: t, label: `Tier ${t}` })),
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
              ...dealerships.map((d) => ({ value: d, label: d })),
            ]}
          />
          <Select
            value={filters.city}
            onChange={(e) => {
              setFilters((f) => ({ ...f, city: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All cities' },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
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
            value={filters.source}
            onChange={(e) => {
              setFilters((f) => ({ ...f, source: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All sources' },
              ...LEAD_SOURCES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={filters.pipeline}
            onChange={(e) => {
              setFilters((f) => ({ ...f, pipeline: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All pipelines' },
              { value: PIPELINE_TYPES.MODEL31, label: 'MODEL 31' },
              { value: PIPELINE_TYPES.DEALERSHIP, label: 'DEALERSHIP' },
            ]}
          />
          <Select
            value={filters.scoreRange}
            onChange={(e) => {
              setFilters((f) => ({ ...f, scoreRange: e.target.value }))
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All scores' },
              { value: '80-100', label: '80–100' },
              { value: '40-79', label: '40–79' },
              { value: '0-39', label: '0–39' },
            ]}
          />
          <Select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(':')
              setSortKey(key)
              setSortDir(dir)
            }}
            options={[
              { value: 'createdAt:desc', label: 'Newest first' },
              { value: 'createdAt:asc', label: 'Oldest first' },
              { value: 'score:desc', label: 'Score high → low' },
              { value: 'score:asc', label: 'Score low → high' },
              { value: 'budget:desc', label: 'Budget high → low' },
              { value: 'budget:asc', label: 'Budget low → high' },
              { value: 'status:asc', label: 'Status A → Z' },
              { value: 'status:desc', label: 'Status Z → A' },
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
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            sortKey={sortKey === 'budget' ? 'budgetValue' : sortKey}
            sortDir={sortDir}
            onSort={(key) => {
              const mapped =
                key === 'budgetValue'
                  ? 'budget'
                  : key === 'createdAt' || key === 'score' || key === 'status'
                    ? key
                    : sortKey
              if (mapped === sortKey) {
                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
              } else {
                setSortKey(mapped)
                setSortDir('asc')
              }
            }}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            onPageChange={setPage}
            emptyTitle="No leads found."
            emptyDescription="Try adjusting your search or filters."
            emptyActionLabel="Clear Filters"
            onEmptyAction={clearFilters}
          />
        )}
      </Card>

      <AssignSalespersonModal
        open={assignOpen}
        lead={activeLead}
        onClose={() => setAssignOpen(false)}
        onAssigned={async () => {
          showToast('Lead assigned successfully.')
          setAssignOpen(false)
          await load()
        }}
      />
      <ChangeStatusModal
        open={statusOpen}
        lead={activeLead}
        onClose={() => setStatusOpen(false)}
        onChanged={async () => {
          showToast('Lead status changed.')
          setStatusOpen(false)
          await load()
        }}
      />
      <AddNoteModal
        open={noteOpen}
        lead={activeLead}
        onClose={() => setNoteOpen(false)}
        onSaved={async () => {
          showToast('Note added.')
          setNoteOpen(false)
          await load()
        }}
      />
      <EditLeadModal
        open={editOpen}
        lead={activeLead}
        onClose={() => setEditOpen(false)}
        onSaved={async () => {
          showToast('Lead updated successfully.')
          setEditOpen(false)
          await load()
        }}
      />
    </div>
  )
}
