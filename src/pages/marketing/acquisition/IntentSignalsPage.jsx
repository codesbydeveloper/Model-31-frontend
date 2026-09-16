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
import Modal from '../../../components/common/Modal'
import Input from '../../../components/common/Input'
import { useToast } from '../../../hooks/useToast'
import { formatNumber } from '../../../utils/table'
import { INTENT_CATEGORIES } from '../../../data/intentSignals'
import {
  getIntentKeywords,
  getIntentSignals,
  getBudgetSignals,
  linkIntentLead,
  linkBudgetLead,
} from '../../../services/api/marketingIntentService'

const SIGNAL_PAGE_SIZE = 8
const TABLE_PAGE_SIZE = 6

export default function IntentSignalsPage() {
  const { showToast } = useToast()
  const [stats, setStats] = useState({
    highIntent: 0,
    mediumIntent: 0,
    lowIntent: 0,
    newSignals: 0,
  })
  const [keywords, setKeywords] = useState([])
  const [signals, setSignals] = useState([])
  const [budgets, setBudgets] = useState([])
  const [keywordTotal, setKeywordTotal] = useState(0)
  const [signalTotal, setSignalTotal] = useState(0)
  const [budgetTotal, setBudgetTotal] = useState(0)
  const [keywordsLoading, setKeywordsLoading] = useState(true)
  const [signalsLoading, setSignalsLoading] = useState(true)
  const [budgetsLoading, setBudgetsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [category, setCategory] = useState('all')
  const [keywordPage, setKeywordPage] = useState(1)
  const [signalPage, setSignalPage] = useState(1)
  const [budgetPage, setBudgetPage] = useState(1)
  const [linkTarget, setLinkTarget] = useState(null)
  const [leadLabel, setLeadLabel] = useState('')
  const [linking, setLinking] = useState(false)

  const loadKeywords = useCallback(async () => {
    setKeywordsLoading(true)
    try {
      const result = await getIntentKeywords({
        page: keywordPage,
        limit: TABLE_PAGE_SIZE,
      })
      setKeywords(result.items)
      setKeywordTotal(result.total)
      if (result.items.length === 0 && keywordPage > 1) {
        setKeywordPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setKeywords([])
      setKeywordTotal(0)
      showToast(err.message || 'Unable to load keywords.', 'error')
    } finally {
      setKeywordsLoading(false)
    }
  }, [keywordPage, showToast])

  const loadSignals = useCallback(async () => {
    setSignalsLoading(true)
    try {
      const result = await getIntentSignals({
        page: signalPage,
        limit: SIGNAL_PAGE_SIZE,
      })
      setStats(result.stats)
      setSignals(result.items)
      setSignalTotal(result.total)
      if (result.items.length === 0 && signalPage > 1) {
        setSignalPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setSignals([])
      setSignalTotal(0)
      showToast(err.message || 'Unable to load intent signals.', 'error')
    } finally {
      setSignalsLoading(false)
    }
  }, [signalPage, showToast])

  const loadBudgets = useCallback(async () => {
    setBudgetsLoading(true)
    try {
      const result = await getBudgetSignals({
        page: budgetPage,
        limit: TABLE_PAGE_SIZE,
      })
      setBudgets(result.items)
      setBudgetTotal(result.total)
      if (result.items.length === 0 && budgetPage > 1) {
        setBudgetPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setBudgets([])
      setBudgetTotal(0)
      showToast(err.message || 'Unable to load budget signals.', 'error')
    } finally {
      setBudgetsLoading(false)
    }
  }, [budgetPage, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void loadKeywords(), 0)
    return () => window.clearTimeout(t)
  }, [loadKeywords])

  useEffect(() => {
    const t = window.setTimeout(() => void loadSignals(), 0)
    return () => window.clearTimeout(t)
  }, [loadSignals])

  useEffect(() => {
    const t = window.setTimeout(() => void loadBudgets(), 0)
    return () => window.clearTimeout(t)
  }, [loadBudgets])

  const filtered = useMemo(() => {
    let list = signals
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
  }, [signals, search, level, category])

  const openLink = (type, row) => {
    setLinkTarget({ type, id: row.id })
    setLeadLabel('')
  }

  const submitLink = async (e) => {
    e.preventDefault()
    if (!linkTarget || !leadLabel.trim()) return
    setLinking(true)
    try {
      if (linkTarget.type === 'budget') {
        await linkBudgetLead(linkTarget.id, leadLabel.trim())
        await loadBudgets()
      } else {
        await linkIntentLead(linkTarget.id, leadLabel.trim())
        await loadSignals()
      }
      showToast(`Lead linked: ${leadLabel.trim()}`)
      setLinkTarget(null)
    } catch (err) {
      showToast(err.message || 'Unable to link lead.', 'error')
    } finally {
      setLinking(false)
    }
  }

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
        {keywordsLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
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
            page={keywordPage}
            pageSize={TABLE_PAGE_SIZE}
            onPageChange={setKeywordPage}
            totalItems={keywordTotal}
            showPagination
            emptyTitle="No keywords found."
          />
        )}
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
        {signalsLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
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
                  return (
                    <Button size="sm" onClick={() => openLink('signal', row)}>
                      Link Lead
                    </Button>
                  )
                },
              },
            ]}
            rows={filtered}
            page={signalPage}
            pageSize={SIGNAL_PAGE_SIZE}
            onPageChange={setSignalPage}
            totalItems={signalTotal}
            showPagination
            emptyTitle="No intent signals found."
          />
        )}
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Budget Signals</h2>
        {budgetsLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
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
                    <Button size="sm" onClick={() => openLink('budget', row)}>
                      Link Lead
                    </Button>
                  ),
              },
            ]}
            rows={budgets}
            page={budgetPage}
            pageSize={TABLE_PAGE_SIZE}
            onPageChange={setBudgetPage}
            totalItems={budgetTotal}
            showPagination
            emptyTitle="No budget signals."
          />
        )}
      </Card>

      <Modal
        open={Boolean(linkTarget)}
        onClose={() => !linking && setLinkTarget(null)}
        title="Link Lead"
      >
        <form onSubmit={submitLink} className="grid gap-3">
          <Input
            label="Lead Label"
            value={leadLabel}
            onChange={(e) => setLeadLabel(e.target.value)}
            placeholder="Lead ID"
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLinkTarget(null)}
              disabled={linking}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={linking || !leadLabel.trim()}>
              {linking ? <LoadingSpinner size={16} /> : 'Link Lead'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
