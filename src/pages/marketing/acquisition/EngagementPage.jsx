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
import { ENGAGEMENT_LEVELS } from '../../../data/acquisitionEngagement'
import engagementService from '../../../services/mock/engagementService'

export default function EngagementPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await engagementService.getEngagementData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.records
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
  }, [data, search, level])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const dmSummary = data.records.reduce(
    (acc, r) => {
      acc.opens += r.dmBehavior?.opens || 0
      acc.replies += r.dmBehavior?.replies || 0
      acc.repeatOpens += r.dmBehavior?.repeatOpens || 0
      acc.returns += r.dmBehavior?.conversationReturns || 0
      return acc
    },
    { opens: 0, replies: 0, repeatOpens: 0, returns: 0 },
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Engagement"
        description="Monitor customer engagement across posts, DMs, stories, and return visits."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="DM Opens" value={formatNumber(dmSummary.opens)} />
        <StatCard label="DM Replies" value={formatNumber(dmSummary.replies)} />
        <StatCard label="Repeat Opens" value={formatNumber(dmSummary.repeatOpens)} />
        <StatCard label="Conversation Returns" value={formatNumber(dmSummary.returns)} />
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
          pageSize={8}
          onPageChange={setPage}
          emptyTitle="No engagement records found."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Story Interactions</h2>
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
          rows={data.stories}
          pageSize={6}
          emptyTitle="No story interactions."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Returning Visitors</h2>
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
          rows={data.returningVisitors}
          pageSize={6}
          emptyTitle="No returning visitors."
        />
      </Card>
    </div>
  )
}
