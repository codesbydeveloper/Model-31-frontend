import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { RecordFacts, columnsForRows } from '../../components/model31/ReadOnlyRecord'
import {
  getHygieneLeads,
  getHygieneStats,
  getMeltPlate,
  getModel31,
  getModel31Guards,
  getModel31Routing,
  getModel31Workflow,
  getQuarantine,
  getRoutingBands,
  getRoutingLogs,
  isAccessBlocked,
  asRows,
} from '../../services/api/model31EngineService'

const TABS = [
  { id: 'engine', label: 'Engine' },
  { id: 'hygiene', label: 'CRM hygiene' },
  { id: 'routing', label: 'Routing' },
  { id: 'guards', label: 'Guards' },
]

const PAGE_SIZE = 20

function blockedCopy(err) {
  return err?.message || 'Access to Model 31 is blocked'
}

function BlockedNote({ message }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-md)] border border-[var(--status-error)]/30 bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error)]"
    >
      {message}. This login email is not on the Model 31 whitelist, so this screen stays locked.
    </div>
  )
}

function RecordCard({ title, note, record, blocked, error, onRetry }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      {note ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{note}</p> : null}
      <div className="mt-4">
        {blocked ? (
          <BlockedNote message={blocked} />
        ) : error ? (
          <ErrorState title="Could not load this section" description={error} onRetry={onRetry} />
        ) : (
          <RecordFacts record={record} />
        )}
      </div>
    </Card>
  )
}

function PagedTable({ title, note, rows, page, total, loading, blocked, error, onPage, onRetry, emptyTitle }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      {note ? <p className="mt-1 mb-4 text-sm text-[var(--text-secondary)]">{note}</p> : <div className="mb-4" />}
      {blocked ? (
        <BlockedNote message={blocked} />
      ) : error ? (
        <ErrorState title="Could not load this list" description={error} onRetry={onRetry} />
      ) : loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <DataTable
          columns={columnsForRows(rows)}
          rows={rows}
          rowKey="_key"
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={total}
          showPagination
          onPageChange={onPage}
          emptyTitle={emptyTitle}
          emptyDescription="When the backend has rows, they show up here. This list is view only."
        />
      )}
    </Card>
  )
}

export default function Model31EnginePage() {
  const [tab, setTab] = useState('engine')
  const [loading, setLoading] = useState(true)
  const [engine, setEngine] = useState({})
  const [workflow, setWorkflow] = useState({})
  const [routing, setRouting] = useState({})
  const [stats, setStats] = useState({})
  const [melt, setMelt] = useState({})
  const [blocked, setBlocked] = useState({})
  const [errors, setErrors] = useState({})

  const [bands, setBands] = useState({ items: [], page: 1, total: 0 })
  const [logs, setLogs] = useState({ items: [], page: 1, total: 0 })
  const [guards, setGuards] = useState({ items: [], penalties: [], page: 1, total: 0 })
  const [quarantine, setQuarantine] = useState({ items: [], page: 1, total: 0 })
  const [leads, setLeads] = useState({ items: [], page: 1, total: 0 })
  const [listLoading, setListLoading] = useState(false)

  const remember = (key, err) => {
    if (isAccessBlocked(err)) {
      setBlocked((current) => ({ ...current, [key]: blockedCopy(err) }))
      setErrors((current) => ({ ...current, [key]: '' }))
      return
    }
    setErrors((current) => ({ ...current, [key]: err.message || 'Request failed.' }))
  }

  const loadSummaries = useCallback(async () => {
    setLoading(true)
    setBlocked((current) => {
      const next = { ...current }
      ;['engine', 'workflow', 'routing', 'stats', 'melt'].forEach((key) => {
        delete next[key]
      })
      return next
    })
    setErrors((current) => {
      const next = { ...current }
      ;['engine', 'workflow', 'routing', 'stats', 'melt'].forEach((key) => {
        delete next[key]
      })
      return next
    })
    const jobs = [
      ['engine', getModel31, setEngine],
      ['workflow', getModel31Workflow, setWorkflow],
      ['routing', getModel31Routing, setRouting],
      ['stats', getHygieneStats, setStats],
      ['melt', getMeltPlate, setMelt],
    ]
    await Promise.all(
      jobs.map(async ([key, loader, setter]) => {
        try {
          setter(await loader())
          setBlocked((current) => ({ ...current, [key]: '' }))
          setErrors((current) => ({ ...current, [key]: '' }))
        } catch (err) {
          setter({})
          remember(key, err)
        }
      }),
    )
    setLoading(false)
  }, [])

  const loadLists = useCallback(async (pages) => {
    setListLoading(true)
    const jobs = [
      ['bands', () => getRoutingBands({ page: pages.bands, limit: PAGE_SIZE }), setBands],
      ['logs', () => getRoutingLogs({ page: pages.logs, limit: PAGE_SIZE }), setLogs],
      ['guards', () => getModel31Guards({ page: pages.guards, limit: PAGE_SIZE }), setGuards],
      ['quarantine', () => getQuarantine({ page: pages.quarantine, limit: PAGE_SIZE }), setQuarantine],
      ['leads', () => getHygieneLeads({ page: pages.leads, limit: PAGE_SIZE }), setLeads],
    ]
    await Promise.all(
      jobs.map(async ([key, loader, setter]) => {
        try {
          const result = await loader()
          setter({
            items: result.items,
            penalties: result.penalties || [],
            page: result.page,
            total: result.total,
          })
          setBlocked((current) => ({ ...current, [key]: '' }))
          setErrors((current) => ({ ...current, [key]: '' }))
        } catch (err) {
          setter({ items: [], penalties: [], page: pages[key], total: 0 })
          remember(key, err)
        }
      }),
    )
    setListLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSummaries()
      void loadLists({ bands: 1, logs: 1, guards: 1, quarantine: 1, leads: 1 })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadSummaries, loadLists])

  const changePage = (key, setter, page) => {
    setter((current) => ({ ...current, page }))
    const pages = {
      bands: bands.page,
      logs: logs.page,
      guards: guards.page,
      quarantine: quarantine.page,
      leads: leads.page,
      [key]: page,
    }
    void loadLists(pages)
  }

  if (loading) {
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
        title="Model 31 Engine"
        description="Read only. Dealership users cannot edit workflows, routing, or settings from here."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              void loadSummaries()
              void loadLists({
                bands: bands.page,
                logs: logs.page,
                guards: guards.page,
                quarantine: quarantine.page,
                leads: leads.page,
              })
            }}
          >
            Refresh
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={tab === item.id ? 'primary' : 'secondary'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === 'engine' ? (
        <div className="grid grid-cols-1 gap-4">
          <RecordCard
            title="Sealed engine"
            note="GET /api/model31. There is no save button. Changes only happen when new code is deployed."
            record={engine}
            blocked={blocked.engine}
            error={errors.engine}
            onRetry={loadSummaries}
          />
          <RecordCard
            title="Workflow"
            note="Live hygiene counts and melt-plate status."
            record={workflow}
            blocked={blocked.workflow}
            error={errors.workflow}
            onRetry={loadSummaries}
          />
        </div>
      ) : null}

      {tab === 'hygiene' ? (
        <div className="grid grid-cols-1 gap-4">
          <RecordCard
            title="Hygiene stats"
            note="Fixes, bad data, and quarantines. The CRM is accepted instantly. Cleaning happens in the background."
            record={stats.stats || stats}
            blocked={blocked.stats}
            error={errors.stats}
            onRetry={loadSummaries}
          />
          <RecordCard
            title="Melt plate"
            note="Checked every 4 hours. Fallback turns on if auto-patch is over 5%, schema drift is over 20, or quarantines are over 10."
            record={melt.meltPlate || melt}
            blocked={blocked.melt}
            error={errors.melt}
            onRetry={loadSummaries}
          />
          {Array.isArray(melt.events) && melt.events.length ? (
            <Card>
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Melt-plate alerts</h2>
              <DataTable
                columns={columnsForRows(asRows({ events: melt.events }, ['events']))}
                rows={asRows({ events: melt.events }, ['events'])}
                rowKey="_key"
                emptyTitle="No melt-plate alerts"
                emptyDescription="Alerts appear here when the CRM drift limits are crossed."
              />
            </Card>
          ) : null}
          <PagedTable
            title="Quarantine"
            note="Leads missing a phone or status. They do not enter the workflow."
            rows={quarantine.items}
            page={quarantine.page}
            total={quarantine.total}
            loading={listLoading}
            blocked={blocked.quarantine}
            error={errors.quarantine}
            onPage={(page) => changePage('quarantine', setQuarantine, page)}
            onRetry={() => changePage('quarantine', setQuarantine, quarantine.page)}
            emptyTitle="No quarantined leads"
          />
          <PagedTable
            title="Cleaned leads"
            note="Leads that passed hygiene. A lead with no salesperson is auto-assigned."
            rows={leads.items}
            page={leads.page}
            total={leads.total}
            loading={listLoading}
            blocked={blocked.leads}
            error={errors.leads}
            onPage={(page) => changePage('leads', setLeads, page)}
            onRetry={() => changePage('leads', setLeads, leads.page)}
            emptyTitle="No cleaned leads yet"
          />
        </div>
      ) : null}

      {tab === 'routing' ? (
        <div className="grid grid-cols-1 gap-4">
          <RecordCard
            title="Routing rules"
            note="A is at least 18% close rate with 20 leads. B is at least 10%. Everyone else is C. There is no route-edit screen."
            record={routing}
            blocked={blocked.routing}
            error={errors.routing}
            onRetry={loadSummaries}
          />
          <PagedTable
            title="Salesperson bands"
            note="A, B, or C from the last 30 days. Recalculated when the server starts, then every 7 days."
            rows={bands.items}
            page={bands.page}
            total={bands.total}
            loading={listLoading}
            blocked={blocked.bands}
            error={errors.bands}
            onPage={(page) => changePage('bands', setBands, page)}
            onRetry={() => changePage('bands', setBands, bands.page)}
            emptyTitle="No bands yet"
          />
          <PagedTable
            title="Why a lead was assigned"
            note="Each row is the reason a lead went to that salesperson. Hot prefers A, warm prefers B, cold prefers C."
            rows={logs.items}
            page={logs.page}
            total={logs.total}
            loading={listLoading}
            blocked={blocked.logs}
            error={errors.logs}
            onPage={(page) => changePage('logs', setLogs, page)}
            onRetry={() => changePage('logs', setLogs, logs.page)}
            emptyTitle="No routing logs yet"
          />
        </div>
      ) : null}

      {tab === 'guards' ? (
        <div className="grid grid-cols-1 gap-4">
          <PagedTable
            title="Blocked actions"
            note="Dead-status attempts that were stopped, and leads taken away after 5 minutes with no reply."
            rows={guards.items}
            page={guards.page}
            total={guards.total}
            loading={listLoading}
            blocked={blocked.guards}
            error={errors.guards}
            onPage={(page) => changePage('guards', setGuards, page)}
            onRetry={() => changePage('guards', setGuards, guards.page)}
            emptyTitle="No guard events yet"
          />
          <PagedTable
            title="SLA penalties"
            note="Logged when a salesperson misses the 5-minute reply window."
            rows={guards.penalties}
            page={1}
            total={guards.penalties.length}
            loading={listLoading}
            blocked={blocked.guards}
            error={errors.guards}
            onPage={() => {}}
            onRetry={() => changePage('guards', setGuards, guards.page)}
            emptyTitle="No penalties yet"
          />
        </div>
      ) : null}
    </div>
  )
}
