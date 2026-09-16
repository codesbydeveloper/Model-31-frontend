import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock3,
  CalendarClock,
  Send,
  Target,
  Eye,
  Percent,
  Users,
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
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber, formatPercent } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { getMarketingDashboard } from '../../services/api/marketingDashboardService'
import PlatformBadge from '../../components/marketing/PlatformBadge'

export default function MarketingDashboard() {
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [platforms, setPlatforms] = useState([])
  const [notifications, setNotifications] = useState([])
  const [trend, setTrend] = useState([])
  const [range, setRange] = useState('30')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMarketingDashboard(range)
      setStats(data.stats)
      setPlatforms(data.platforms)
      setNotifications(data.notifications)
      setTrend(data.trend)
    } catch (err) {
      setStats({
        totalContent: 0,
        pendingApproval: 0,
        scheduledPosts: 0,
        publishedPosts: 0,
        activeCampaigns: 0,
        totalReach: 0,
        engagementRate: 0,
        leadsGenerated: 0,
      })
      setPlatforms([])
      setNotifications([])
      setTrend([])
      showToast(err.message || 'Unable to load marketing dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [range, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !stats) {
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
        title="Marketing Dashboard"
        description="Buyer-signal support portal. Model 31 generates sales-script words only — it does not auto-publish posts or videos."
        actions={
          <Link to="/marketing/content/create">
            <Button>Create Sales Script</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Content" value={formatNumber(stats.totalContent)} icon={FileText} />
        <StatCard label="Pending Approval" value={formatNumber(stats.pendingApproval)} icon={Clock3} />
        <StatCard label="Scheduled Posts" value={formatNumber(stats.scheduledPosts)} icon={CalendarClock} />
        <StatCard label="Published Posts" value={formatNumber(stats.publishedPosts)} icon={Send} />
        <StatCard label="Active Campaigns" value={formatNumber(stats.activeCampaigns)} icon={Target} />
        <StatCard label="Total Reach" value={formatNumber(stats.totalReach)} icon={Eye} />
        <StatCard label="Engagement Rate" value={formatPercent(stats.engagementRate)} icon={Percent} />
        <StatCard label="Leads Generated" value={formatNumber(stats.leadsGenerated)} icon={Users} />
      </div>

      <Card className="mt-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Content Performance</h2>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            options={[
              { value: '7', label: '7 Days' },
              { value: '30', label: '30 Days' },
              { value: '90', label: '90 Days' },
            ]}
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="published" name="Content Published" stroke="#0f2b46" strokeWidth={2} />
              <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#1a7a4c" strokeWidth={2} />
              <Line type="monotone" dataKey="reach" name="Reach" stroke="#1a6b8a" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#9a6b1a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <h2 className="mb-3 mt-6 text-base font-semibold">Social Platform Performance</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {platforms.map((p) => (
          <Card key={p.platform}>
            <div className="flex items-center justify-between">
              <PlatformBadge platform={p.platform} />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {p.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-[var(--text-muted)]">Posts</dt>
                <dd className="font-semibold">{formatNumber(p.posts)}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Reach</dt>
                <dd className="font-semibold">{formatNumber(p.reach)}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Engagement</dt>
                <dd className="font-semibold">{formatPercent(p.engagement)}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Leads</dt>
                <dd className="font-semibold">{formatNumber(p.leads)}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Notifications</h2>
          <Link to="/marketing/approval">
            <Button size="sm" variant="ghost">
              Open Queue
            </Button>
          </Link>
        </div>
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
            >
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{n.message}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{n.time}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
