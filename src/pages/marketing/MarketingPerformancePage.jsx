import { useCallback, useEffect, useMemo, useState } from 'react'
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
import marketingAnalyticsService from '../../services/mock/marketingAnalyticsService'
import campaignService from '../../services/mock/campaignService'
import { DEALERSHIPS, SOCIAL_PLATFORMS } from '../../data/marketingContent'

export default function MarketingPerformancePage() {
  const [range, setRange] = useState('30')
  const [dealership, setDealership] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [campaign, setCampaign] = useState('all')
  const [campaigns, setCampaigns] = useState([])
  const [data, setData] = useState(null)
  const [top, setTop] = useState([])
  const [sortBy, setSortBy] = useState('reach')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [analytics, topRows, camps] = await Promise.all([
        marketingAnalyticsService.getMarketingAnalytics(range),
        marketingAnalyticsService.getTopContent(sortBy),
        campaignService.getCampaigns(),
      ])
      setData(analytics)
      setTop(topRows)
      setCampaigns(camps)
    } finally {
      setLoading(false)
    }
  }, [range, sortBy])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filteredTop = useMemo(() => {
    let rows = top
    if (platform !== 'all') rows = rows.filter((r) => r.platform === platform)
    // dealership/campaign filters are UI-ready; mock top content is global
    void dealership
    void campaign
    return rows
  }, [top, platform, dealership, campaign])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const { kpis, trend, leadsByPlatform, leadsByCampaign } = data

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
          onChange={(e) => setRange(e.target.value)}
          options={[
            { value: '7', label: '7 Days' },
            { value: '30', label: '30 Days' },
            { value: '90', label: '90 Days' },
          ]}
        />
        <Select
          value={dealership}
          onChange={(e) => setDealership(e.target.value)}
          options={[
            { value: 'all', label: 'All dealerships' },
            ...DEALERSHIPS.map((d) => ({ value: d, label: d })),
          ]}
        />
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          options={[
            { value: 'all', label: 'All platforms' },
            ...SOCIAL_PLATFORMS.map((d) => ({ value: d, label: d })),
          ]}
        />
        <Select
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          options={[
            { value: 'all', label: 'All campaigns' },
            ...campaigns.map((c) => ({ value: c.name, label: c.name })),
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Reach" value={formatNumber(kpis.reach)} />
        <StatCard label="Impressions" value={formatNumber(kpis.impressions)} />
        <StatCard label="Engagement" value={formatPercent(kpis.engagement)} />
        <StatCard label="Clicks" value={formatNumber(kpis.clicks)} />
        <StatCard label="Leads" value={formatNumber(kpis.leads)} />
        <StatCard label="Appointments" value={formatNumber(kpis.appointments)} />
        <StatCard label="Sold Deals" value={formatNumber(kpis.soldDeals)} />
        <StatCard label="Revenue" value={`$${formatNumber(kpis.revenue)}`} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Reach over time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
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
              <LineChart data={trend}>
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
              <BarChart data={leadsByPlatform}>
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
              <BarChart data={leadsByCampaign}>
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

      <Card className="mt-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Top Content</h2>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'reach', label: 'Sort by Reach' },
              { value: 'engagement', label: 'Sort by Engagement' },
              { value: 'leads', label: 'Sort by Leads' },
            ]}
          />
        </div>
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
            { key: 'clicks', label: 'Clicks' },
            { key: 'leads', label: 'Leads' },
            { key: 'appointments', label: 'Appointments' },
          ]}
          rows={filteredTop}
          pageSize={8}
        />
      </Card>
    </div>
  )
}
