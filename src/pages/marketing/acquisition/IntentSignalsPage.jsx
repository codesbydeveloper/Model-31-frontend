import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import StatCard from '../../../components/common/StatCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../hooks/useToast'
import { formatNumber } from '../../../utils/table'
import { INTENT_CATEGORIES } from '../../../data/intentSignals'
import intentService from '../../../services/mock/intentService'
import acquisitionService from '../../../services/mock/acquisitionService'

export default function IntentSignalsPage() {
  const { showToast } = useToast()
  const [intentData, setIntentData] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [category, setCategory] = useState('all')
  const [creatingId, setCreatingId] = useState(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [intent, budgetRows] = await Promise.all([
        intentService.getIntentSignals(),
        intentService.getBudgetSignals(),
      ])
      setIntentData(intent)
      setBudgets(budgetRows)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (!intentData) return []
    let list = intentData.signals
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.detectedPhrase.toLowerCase().includes(q) ||
          r.vehicle.toLowerCase().includes(q),
      )
    }
    if (level !== 'all') list = list.filter((r) => r.intentLevel === level)
    if (category !== 'all') list = list.filter((r) => r.category === category)
    return list
  }, [intentData, search, level, category])

  const createLead = async (row) => {
    setCreatingId(row.id)
    try {
      await acquisitionService.createMockLeadFromSignal({
        customerName: row.customerName,
        vehicle: row.vehicle,
        budget: row.budget,
        timeline: row.timeline,
        location: row.location,
        financing: row.financing,
        score: row.score,
        intent: row.intentLevel,
        source: 'Intent Signal',
      })
      showToast('Mock lead created successfully.')
      await load()
    } finally {
      setCreatingId(null)
    }
  }

  if (loading || !intentData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const { stats, keywords } = intentData

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Intent Signals"
        description="Detect buying intent from phrases, budget cues, and customer conversations."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="High Intent" value={formatNumber(stats.highIntent)} />
        <StatCard label="Medium Intent" value={formatNumber(stats.mediumIntent)} />
        <StatCard label="Low Intent" value={formatNumber(stats.lowIntent)} />
        <StatCard label="New Signals" value={formatNumber(stats.newSignals)} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Intent Keywords</h2>
        <DataTable
          columns={[
            { key: 'keyword', label: 'Keyword' },
            { key: 'category', label: 'Category' },
            { key: 'occurrences', label: 'Occurrences' },
            { key: 'customers', label: 'Customers' },
            {
              key: 'intentLevel',
              label: 'Intent',
              render: (row) => <StatusBadge status={row.intentLevel} />,
            },
            { key: 'lastDetected', label: 'Last Detected' },
          ]}
          rows={keywords}
          pageSize={6}
          emptyTitle="No keywords found."
        />
      </Card>

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers or phrases..."
          />
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={[
              { value: 'all', label: 'All intent levels' },
              { value: 'HIGH', label: 'HIGH' },
              { value: 'MEDIUM', label: 'MEDIUM' },
              { value: 'LOW', label: 'LOW' },
            ]}
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All categories' },
              ...INTENT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>

        <h2 className="mb-3 text-base font-semibold">Customer Intent Signals</h2>
        <DataTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            {
              key: 'detectedPhrase',
              label: 'Detected Phrase',
              render: (row) => (
                <span className="line-clamp-2 max-w-xs text-[var(--text-secondary)]">
                  {row.detectedPhrase}
                </span>
              ),
            },
            { key: 'category', label: 'Category' },
            { key: 'vehicle', label: 'Vehicle' },
            { key: 'budget', label: 'Budget' },
            { key: 'timeline', label: 'Timeline' },
            {
              key: 'intentLevel',
              label: 'Intent',
              render: (row) => <StatusBadge status={row.intentLevel} />,
            },
            { key: 'detectedDate', label: 'Detected' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => {
                if (row.leadId) {
                  return (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => showToast(`Lead linked: ${row.leadId}`)}
                    >
                      Lead Linked
                    </Button>
                  )
                }
                if (row.intentLevel !== 'HIGH') {
                  return <span className="text-xs text-[var(--text-muted)]">—</span>
                }
                return (
                  <Button
                    size="sm"
                    disabled={creatingId === row.id}
                    onClick={() => void createLead(row)}
                  >
                    {creatingId === row.id ? (
                      <LoadingSpinner size={16} />
                    ) : (
                      'Create Mock Lead'
                    )}
                  </Button>
                )
              },
            },
          ]}
          rows={filtered}
          page={page}
          pageSize={8}
          onPageChange={setPage}
          emptyTitle="No intent signals found."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Budget Signals</h2>
        <DataTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'budgetSignal', label: 'Budget Signal' },
            { key: 'paymentAmount', label: 'Payment' },
            { key: 'financing', label: 'Financing' },
            { key: 'vehicle', label: 'Vehicle' },
            {
              key: 'intent',
              label: 'Intent',
              render: (row) => <StatusBadge status={row.intent} />,
            },
            { key: 'date', label: 'Date' },
            {
              key: 'leadId',
              label: 'Lead',
              render: (row) =>
                row.leadId ? (
                  <button
                    type="button"
                    className="text-sm font-medium text-[var(--brand-accent)] hover:underline"
                    onClick={() => showToast(`Lead linked: ${row.leadId}`)}
                  >
                    {row.leadId}
                  </button>
                ) : (
                  '—'
                ),
            },
          ]}
          rows={budgets}
          pageSize={6}
          emptyTitle="No budget signals."
        />
      </Card>
    </div>
  )
}
