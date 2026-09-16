import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import StatCard from '../../../components/common/StatCard'
import { formatNumber } from '../../../utils/table'
import { useToast } from '../../../hooks/useToast'
import { ENGAGEMENT_LEVELS } from '../../../data/acquisitionEngagement'
import { getMarketingEngagement, getStoryInteractions, getReturningVisitors } from '../../../services/api/marketingEngagementService'

const PAGE_SIZE = 8
const TABLE_PAGE_SIZE = 6

export default function EngagementPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({
    dmOpens: 0,
    dmReplies: 0,
    repeatOpens: 0,
    conversationReturns: 0,
  })
  const [stories, setStories] = useState([])
  const [returningVisitors, setReturningVisitors] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [storyTotal, setStoryTotal] = useState(0)
  const [returningTotal, setReturningTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [storiesLoading, setStoriesLoading] = useState(true)
  const [returningLoading, setReturningLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)
  const [storyPage, setStoryPage] = useState(1)
  const [returningPage, setReturningPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMarketingEngagement({
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setStats(result.stats)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load engagement.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  const loadStories = useCallback(async () => {
    setStoriesLoading(true)
    try {
      const result = await getStoryInteractions({
        page: storyPage,
        limit: TABLE_PAGE_SIZE,
      })
      setStories(result.items)
      setStoryTotal(result.total)
      if (result.items.length === 0 && storyPage > 1) {
        setStoryPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setStories([])
      setStoryTotal(0)
      showToast(err.message || 'Unable to load story interactions.', 'error')
    } finally {
      setStoriesLoading(false)
    }
  }, [storyPage, showToast])

  const loadReturning = useCallback(async () => {
    setReturningLoading(true)
    try {
      const result = await getReturningVisitors({
        page: returningPage,
        limit: TABLE_PAGE_SIZE,
      })
      setReturningVisitors(result.items)
      setReturningTotal(result.total)
      if (result.items.length === 0 && returningPage > 1) {
        setReturningPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setReturningVisitors([])
      setReturningTotal(0)
      showToast(err.message || 'Unable to load returning visitors.', 'error')
    } finally {
      setReturningLoading(false)
    }
  }, [returningPage, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  useEffect(() => {
    const t = window.setTimeout(() => void loadStories(), 0)
    return () => window.clearTimeout(t)
  }, [loadStories])

  useEffect(() => {
    const t = window.setTimeout(() => void loadReturning(), 0)
    return () => window.clearTimeout(t)
  }, [loadReturning])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.persona.toLowerCase().includes(q) ||
          r.platform.toLowerCase().includes(q),
      )
    }
    if (level !== 'all') list = list.filter((r) => r.engagementLevel === level)
    return list
  }, [rows, search, level])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Engagement"
        description="Monitor customer engagement across posts, DMs, stories, and return visits."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="DM Opens" value={formatNumber(stats.dmOpens)} />
        <StatCard label="DM Replies" value={formatNumber(stats.dmReplies)} />
        <StatCard label="Repeat Opens" value={formatNumber(stats.repeatOpens)} />
        <StatCard label="Conversation Returns" value={formatNumber(stats.conversationReturns)} />
      </div>

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
          />
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={[
              { value: 'all', label: 'All engagement levels' },
              ...ENGAGEMENT_LEVELS.map((l) => ({ value: l, label: l })),
            ]}
          />
        </div>

        <h2 className="mb-3 text-base font-semibold">Engaged Customers</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'customerName',
                label: 'Customer',
                render: (row) => (
                  <Link
                    to={`/marketing/acquisition/engagement/${row.id}`}
                    className="font-medium text-[var(--brand-accent)] hover:underline"
                  >
                    {row.customerName}
                  </Link>
                ),
              },
              { key: 'persona', label: 'Persona' },
              { key: 'platform', label: 'Platform' },
              { key: 'likes', label: 'Likes' },
              { key: 'comments', label: 'Comments' },
              { key: 'dmInteractions', label: 'DMs' },
              { key: 'storyInteractions', label: 'Stories' },
              { key: 'returnVisits', label: 'Returns' },
              {
                key: 'engagementLevel',
                label: 'Level',
                render: (row) => <StatusBadge status={row.engagementLevel} />,
              },
              { key: 'lastActivity', label: 'Last Activity' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/marketing/acquisition/engagement/${row.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No engagement records found."
          />
        )}
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Story Interactions</h2>
        {storiesLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'story', label: 'Story' },
              { key: 'platform', label: 'Platform' },
              { key: 'interaction', label: 'Interaction' },
              { key: 'date', label: 'Date' },
              {
                key: 'intent',
                label: 'Intent',
                render: (row) => <StatusBadge status={row.intent} />,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={stories}
            page={storyPage}
            pageSize={TABLE_PAGE_SIZE}
            onPageChange={setStoryPage}
            totalItems={storyTotal}
            showPagination
            emptyTitle="No story interactions."
          />
        )}
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Returning Visitors</h2>
        {returningLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'firstVisit', label: 'First Visit' },
              { key: 'latestVisit', label: 'Latest Visit' },
              { key: 'visitCount', label: 'Visits' },
              { key: 'lastInteraction', label: 'Last Interaction' },
              {
                key: 'engagementLevel',
                label: 'Engagement',
                render: (row) => <StatusBadge status={row.engagementLevel} />,
              },
              {
                key: 'potentialIntent',
                label: 'Potential Intent',
                render: (row) => <StatusBadge status={row.potentialIntent} />,
              },
            ]}
            rows={returningVisitors}
            page={returningPage}
            pageSize={TABLE_PAGE_SIZE}
            onPageChange={setReturningPage}
            totalItems={returningTotal}
            showPagination
            emptyTitle="No returning visitors."
          />
        )}
      </Card>
    </div>
  )
}
