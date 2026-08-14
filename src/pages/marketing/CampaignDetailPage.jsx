import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { formatNumber, formatPercent } from '../../utils/table'
import campaignService from '../../services/mock/campaignService'
import marketingContentService from '../../services/mock/marketingContentService'
import scheduledPostService from '../../services/mock/scheduledPostService'
import attributionService from '../../services/mock/attributionService'

const TABS = ['Overview', 'Content', 'Scheduled Posts', 'Performance', 'Attribution']

export default function CampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [content, setContent] = useState([])
  const [scheduled, setScheduled] = useState([])
  const [attribution, setAttribution] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, allContent, posts, attr] = await Promise.all([
        campaignService.getCampaignById(id),
        marketingContentService.getContent(),
        scheduledPostService.getScheduledPosts(),
        attributionService.getAttributionData(),
      ])
      setCampaign(c)
      if (c) {
        setContent(allContent.filter((item) => item.campaign === c.name))
        setScheduled(posts.filter((p) => p.campaign === c.name))
        setAttribution(attr.rows.filter((r) => r.campaign === c.name))
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!campaign) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Campaign not found</h1>
        <Link to="/marketing/campaigns" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={campaign.name}
        description={`${campaign.dealership} · ${campaign.objective}`}
        actions={<StatusBadge status={campaign.status} />}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={tab === name ? 'primary' : 'secondary'}
            onClick={() => setTab(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <Card className="mb-4">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info label="Dealership" value={campaign.dealership} />
              <Info label="Objective" value={campaign.objective} />
              <Info label="Date range" value={`${campaign.startDate} → ${campaign.endDate}`} />
              <Info label="Budget" value={`$${formatNumber(campaign.budget)}`} />
              <Info
                label="Platforms"
                value={
                  <div className="flex flex-wrap justify-end gap-1">
                    {campaign.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                }
              />
              <Info label="Audience" value={campaign.audience} />
            </dl>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{campaign.description}</p>
          </Card>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Reach" value={formatNumber(campaign.stats.reach)} />
            <StatCard label="Engagement" value={formatPercent(campaign.stats.engagement)} />
            <StatCard label="Leads" value={formatNumber(campaign.stats.leads)} />
            <StatCard label="Appointments" value={formatNumber(campaign.stats.appointments)} />
            <StatCard label="Sold Deals" value={formatNumber(campaign.stats.soldDeals)} />
          </div>
        </>
      )}

      {tab === 'Content' && (
        <Card>
          <DataTable
            columns={[
              { key: 'title', label: 'Content' },
              { key: 'contentType', label: 'Type' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={content}
            pageSize={8}
            emptyTitle="No content linked to this campaign."
          />
        </Card>
      )}

      {tab === 'Scheduled Posts' && (
        <Card>
          <DataTable
            columns={[
              { key: 'contentTitle', label: 'Content' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              { key: 'date', label: 'Date' },
              { key: 'time', label: 'Time' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={scheduled}
            pageSize={8}
            emptyTitle="No scheduled posts for this campaign."
          />
        </Card>
      )}

      {tab === 'Performance' && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Reach" value={formatNumber(campaign.stats.reach)} />
          <StatCard label="Engagement" value={formatPercent(campaign.stats.engagement)} />
          <StatCard label="Leads" value={formatNumber(campaign.stats.leads)} />
          <StatCard label="Appointments" value={formatNumber(campaign.stats.appointments)} />
          <StatCard label="Sold Deals" value={formatNumber(campaign.stats.soldDeals)} />
        </div>
      )}

      {tab === 'Attribution' && (
        <Card>
          <DataTable
            columns={[
              { key: 'platform', label: 'Platform' },
              { key: 'content', label: 'Content' },
              { key: 'leads', label: 'Leads' },
              { key: 'qualifiedLeads', label: 'Qualified' },
              { key: 'appointments', label: 'Appointments' },
              { key: 'soldDeals', label: 'Sold' },
              {
                key: 'revenue',
                label: 'Revenue',
                render: (row) => `$${formatNumber(row.revenue)}`,
              },
            ]}
            rows={attribution}
            pageSize={8}
            emptyTitle="No attribution rows for this campaign."
          />
        </Card>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
