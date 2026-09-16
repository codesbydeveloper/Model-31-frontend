import { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { formatNumber, formatPercent } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import {
  getPerformanceStats,
  getPerformanceCharts,
  getTopContent,
} from '../../services/api/marketingPerformanceService'

const PAGE_SIZE = 8
const EMPTY_STATS = {
  reach: 0,
  impressions: 0,
  engagement: 0,
  clicks: 0,
  leads: 0,
  appointments: 0,
  soldDeals: 0,
  revenue: 0,
}

export default function MarketingPerformancePage() {
  const { showToast } = useToast()
  const [range, setRange] = useState('30')
  const [dealershipId, setDealershipId] = useState('ALL')
  const [platform, setPlatform] = useState('ALL')
  const [campaignId, setCampaignId] = useState('ALL')
  const [periods, setPeriods] = useState([
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
  ])
  const [dealerships, setDealerships] = useState([{ id: 'ALL', name: 'All dealerships' }])
  const [platforms, setPlatforms] = useState(['ALL'])
  const [campaigns, setCampaigns] = useState([{ id: 'ALL', name: 'All campaigns' }])
  const [sortOptions, setSortOptions] = useState(['reach', 'engagement', 'clicks', 'leads', 'appointments'])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [charts, setCharts] = useState({
    reachOverTime: [],
    engagementOverTime: [],
    leadsByPlatform: [],
    leadsByCampaign: [],
  })
  const [top, setTop] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('reach')
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)

  const filters = {
    rangeDays: range,
    dealershipId,
    platform,
    campaignId,
  }

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const [statsResult, chartResult] = await Promise.all([
        getPerformanceStats(filters),
        getPerformanceCharts(filters),
      ])
      setStats(statsResult.stats)
      setCharts(chartResult)
      if (statsResult.options.periods?.length) setPeriods(statsResult.options.periods)
      if (statsResult.options.dealerships?.length) setDealerships(statsResult.options.dealerships)
      if (statsResult.options.platforms?.length) setPlatforms(statsResult.options.platforms)
      if (statsResult.options.campaigns?.length) setCampaigns(statsResult.options.campaigns)
      if (statsResult.options.sortOptions?.length) setSortOptions(statsResult.options.sortOptions)
    } catch (err) {
      setStats(EMPTY_STATS)
      setCharts({
        reachOverTime: [],
        engagementOverTime: [],
        leadsByPlatform: [],
        leadsByCampaign: [],
      })
      showToast(err.message || 'Unable to load performance.', 'error')
    } finally {
      setLoading(false)
    }
  }, [range, dealershipId, platform, campaignId, showToast])

  const loadTop = useCallback(async () => {
    setTableLoading(true)
    try {
      const result = await getTopContent({
        ...filters,
        page,
        limit: PAGE_SIZE,
        sortBy,
      })
      setTop(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setTop([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load top content.', 'error')
    } finally {
      setTableLoading(false)
    }
  }, [range, dealershipId, platform, campaignId, page, sortBy, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void loadSummary(), 0)
    return () => window.clearTimeout(t)
  }, [loadSummary])

  useEffect(() => {
    const t = window.setTimeout(() => void loadTop(), 0)
    return () => window.clearTimeout(t)
  }, [loadTop])

  const resetPage = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Marketing Performance"
        description="Analyze reach, engagement, leads and revenue across channels."
      />

      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        <Select
          value={range}
          onChange={resetPage(setRange)}
          options={periods.map((p) => ({ value: String(p.value), label: p.label }))}
        />
        <Select
          value={dealershipId}
          onChange={resetPage(setDealershipId)}
          options={dealerships.map((d) => ({ value: d.id, label: d.name }))}
        />
        <Select
          value={platform}
          onChange={resetPage(setPlatform)}
          options={platforms.map((p) => ({
            value: p,
            label: p === 'ALL' ? 'All platforms' : p,
          }))}
        />
        <Select
          value={campaignId}
          onChange={resetPage(setCampaignId)}
          options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Reach" value={formatNumber(stats.reach)} />
            <StatCard label="Impressions" value={formatNumber(stats.impressions)} />
            <StatCard label="Engagement" value={formatPercent(stats.engagement)} />
            <StatCard label="Clicks" value={formatNumber(stats.clicks)} />
            <StatCard label="Leads" value={formatNumber(stats.leads)} />
            <StatCard label="Appointments" value={formatNumber(stats.appointments)} />
            <StatCard label="Sold Deals" value={formatNumber(stats.soldDeals)} />
            <StatCard label="Revenue" value={`$${formatNumber(stats.revenue)}`} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-base font-semibold">Reach over time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.reachOverTime}>
                    <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reach" stroke="#1a6b8a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-base font-semibold">Engagement over time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.engagementOverTime}>
                    <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#1a7a4c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-base font-semibold">Leads by platform</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.leadsByPlatform}>
                    <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f2b46" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-base font-semibold">Leads by campaign</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.leadsByCampaign}>
                    <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#9a6b1a" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      <Card className="mt-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Top Content</h2>
          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            options={sortOptions.map((option) => ({
              value: option,
              label: `Sort by ${option.charAt(0).toUpperCase()}${option.slice(1)}`,
            }))}
          />
        </div>
        {tableLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'content', label: 'Content' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              {
                key: 'reach',
                label: 'Reach',
                render: (row) => formatNumber(row.reach),
              },
              {
                key: 'engagement',
                label: 'Engagement',
                render: (row) => formatPercent(row.engagement),
              },
              {
                key: 'clicks',
                label: 'Clicks',
                render: (row) => formatNumber(row.clicks),
              },
              {
                key: 'leads',
                label: 'Leads',
                render: (row) => formatNumber(row.leads),
              },
              {
                key: 'appointments',
                label: 'Appointments',
                render: (row) => formatNumber(row.appointments),
              },
            ]}
            rows={top}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No top content found."
          />
        )}
      </Card>
    </div>
  )
}
