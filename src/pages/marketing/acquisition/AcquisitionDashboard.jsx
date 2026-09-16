import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Flame,
  Wallet,
  RotateCcw,
  Share2,
  CalendarHeart,
  UserCircle2,
  MessageSquareReply,
  Heart,
  MessageCircle,
  Forward,
  Bookmark,
  MessagesSquare,
  Sparkles,
} from 'lucide-react'
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
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import StatCard from '../../../components/common/StatCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import FunnelVisual from '../../../components/common/FunnelVisual'
import { formatNumber } from '../../../utils/table'
import { useToast } from '../../../hooks/useToast'
import { getAcquisitionDashboard } from '../../../services/api/marketingDashboardService'

const KPI_META = [
  { key: 'engagedPeople', label: 'Engaged People', icon: Users },
  { key: 'highIntent', label: 'High Intent', icon: Flame },
  { key: 'budgetSignals', label: 'Budget Signals', icon: Wallet },
  { key: 'returningVisitors', label: 'Returning Visitors', icon: RotateCcw },
  { key: 'referrals', label: 'Referrals', icon: Share2 },
  { key: 'lifeEvents', label: 'Life Events', icon: CalendarHeart },
  { key: 'activePersonas', label: 'Active Personas', icon: UserCircle2 },
  { key: 'activeFollowUps', label: 'Active Follow-Ups', icon: MessageSquareReply },
]

const ENGAGEMENT_META = [
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'comments', label: 'Comments', icon: MessageCircle },
  { key: 'shares', label: 'Shares', icon: Forward },
  { key: 'saves', label: 'Saves', icon: Bookmark },
  { key: 'dmInteractions', label: 'DM Interactions', icon: MessagesSquare },
  { key: 'storyReplies', label: 'Story Replies', icon: Sparkles },
  { key: 'storyReactions', label: 'Story Reactions', icon: Heart },
  { key: 'returnVisits', label: 'Return Visits', icon: RotateCcw },
]

function ChartCard({ title, children }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </Card>
  )
}

export default function AcquisitionDashboard() {
  const { showToast } = useToast()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setOverview(await getAcquisitionDashboard())
    } catch (err) {
      setOverview(null)
      showToast(err.message || 'Unable to load acquisition dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !overview) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const { kpis, funnel, engagementOverview, charts } = overview

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Customer Acquisition"
        description="Monitor customer engagement, buying signals, referrals, personas, communities and follow-up activity."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/marketing/acquisition/engagement">
              <Button variant="secondary" size="sm">
                Engagement
              </Button>
            </Link>
            <Link to="/marketing/acquisition/intent">
              <Button variant="secondary" size="sm">
                Intent
              </Button>
            </Link>
            <Link to="/marketing/acquisition/follow-ups">
              <Button size="sm">Follow-Ups</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_META.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            value={formatNumber(kpis[key])}
            icon={icon}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Model 31 Leads</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Model 31 Leads Generated"
              value={formatNumber(kpis.model31Leads)}
            />
            <StatCard
              label="Model 31 Qualified"
              value={formatNumber(kpis.model31Qualified)}
            />
            <StatCard
              label="Model 31 Appointments"
              value={formatNumber(kpis.model31Appointments)}
            />
            <StatCard
              label="Model 31 Sold"
              value={formatNumber(kpis.model31Sold)}
            />
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Dealership Leads</h2>
          <StatCard
            label="Dealership Leads"
            value={formatNumber(kpis.dealershipLeads)}
          />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {overview.dealershipNote ||
              'Dealership pipeline totals are shown separately and are not combined with Model 31 acquisition.'}
          </p>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-base font-semibold">Acquisition Funnel</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            From engagement through sold.
          </p>
          <FunnelVisual stages={funnel} />
        </Card>

        <Card>
          <h2 className="mb-1 text-base font-semibold">Engagement Overview</h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Platform interaction volume this period.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ENGAGEMENT_META.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Icon size={14} />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {formatNumber(engagementOverview[key])}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-6 text-base font-semibold">Conversion Charts</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Engagement → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.engagementToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#0f2b46" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#1a7a4c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Intent → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.intentToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="intent" name="Intent" stroke="#1a6b8a" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#9a6b1a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Referrals → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.referralsToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="referrals" name="Referrals" fill="#0f2b46" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="#1a7a4c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Life Events → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.lifeEventsToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" name="Events" fill="#1a6b8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="#9a6b1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Persona → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.personaToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="leads" name="Leads" fill="#0f2b46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Community → Leads">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.communityToLeads}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="communities" name="Communities" stroke="#0f2b46" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#1a7a4c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Follow-Up Conversion">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.followUpConversion}>
              <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="started" name="Started" fill="#0f2b46" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" name="Converted" fill="#1a7a4c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
