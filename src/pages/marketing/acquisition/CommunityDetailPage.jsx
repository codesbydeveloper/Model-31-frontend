import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import StatCard from '../../../components/common/StatCard'
import StatusBadge from '../../../components/common/StatusBadge'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { formatNumber } from '../../../utils/table'
import communityService from '../../../services/mock/communityService'

export default function CommunityDetailPage() {
  const { id } = useParams()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCommunity(await communityService.getCommunityDetails(id))
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

  if (!community) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Community not found</h1>
        <Link to="/marketing/acquisition/communities" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/acquisition/communities">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={community.name}
        description={`${community.platform} · ${community.location}`}
        actions={<StatusBadge status={community.status} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Audience" value={formatNumber(community.audience)} />
        <StatCard label="Engagement" value={formatNumber(community.engagement)} />
        <StatCard label="Leads" value={formatNumber(community.leads)} />
        <StatCard label="Qualified" value={formatNumber(community.qualifiedLeads)} />
        <StatCard label="Appointments" value={formatNumber(community.appointments)} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Community Details</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Platform" value={community.platform} />
          <Info label="Location" value={community.location} />
          <Info label="Last Activity" value={community.lastActivity} />
          <Info label="Status" value={<StatusBadge status={community.status} />} />
        </dl>
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Recent Activity</h2>
        {(community.activity || []).length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {community.activity.map((event) => (
              <li
                key={event.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{event.type}</p>
                  <p className="text-xs text-[var(--text-muted)]">{event.time}</p>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{event.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}
