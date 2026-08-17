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
import AcquisitionSignalsCard from '../../../components/acquisition/AcquisitionSignalsCard'
import { useToast } from '../../../hooks/useToast'
import { formatNumber } from '../../../utils/table'
import engagementService from '../../../services/mock/engagementService'
import acquisitionService from '../../../services/mock/acquisitionService'

export default function EngagementDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await engagementService.getEngagementByCustomer(id))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const createLead = async () => {
    if (!item) return
    setCreating(true)
    try {
      await acquisitionService.createMockLeadFromSignal({
        customerName: item.customerName,
        source: 'Engagement Signal',
        intent: item.engagementLevel,
        score: item.engagementLevel === 'VERY HIGH' ? 88 : 78,
        vehicle: 'SUV',
        location: 'Miami',
      })
      showToast('Mock lead created successfully.')
      await load()
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Engagement record not found</h1>
        <Link to="/marketing/acquisition/engagement" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const dm = item.dmBehavior || {}

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/acquisition/engagement">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.customerName}
        description={`${item.persona} · ${item.platform} · ${item.dealership}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.engagementLevel} />
            {item.leadId ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast(`Lead linked: ${item.leadId}`)}
              >
                Potential Lead
              </Button>
            ) : (
              <Button size="sm" onClick={createLead} disabled={creating}>
                {creating ? <LoadingSpinner size={16} /> : 'Create Mock Lead'}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Likes" value={formatNumber(item.likes)} />
        <StatCard label="Comments" value={formatNumber(item.comments)} />
        <StatCard label="DM Interactions" value={formatNumber(item.dmInteractions)} />
        <StatCard label="Return Visits" value={formatNumber(item.returnVisits)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Customer Details</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Info label="First Interaction" value={item.firstInteraction} />
            <Info label="Last Interaction" value={item.lastInteraction} />
            <Info label="Total Interactions" value={formatNumber(item.totalInteractions)} />
            <Info label="Shares" value={formatNumber(item.shares)} />
            <Info label="Saves" value={formatNumber(item.saves)} />
            <Info label="Story Interactions" value={formatNumber(item.storyInteractions)} />
            <Info
              label="Lead"
              value={item.leadId ? `Lead linked: ${item.leadId}` : 'No lead yet'}
            />
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold">DM Behavior</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Opens" value={formatNumber(dm.opens)} />
            <Info label="Replies" value={formatNumber(dm.replies)} />
            <Info label="Repeat Opens" value={formatNumber(dm.repeatOpens)} />
            <Info label="Conversation Returns" value={formatNumber(dm.conversationReturns)} />
            <Info label="Response Time" value={dm.responseTime || '—'} />
            <Info
              label="Engagement Level"
              value={<StatusBadge status={dm.engagementLevel || item.engagementLevel} />}
            />
          </dl>
        </Card>
      </div>

      <AcquisitionSignalsCard customerName={item.customerName} />

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Activity Timeline</h2>
        <ul className="space-y-2">
          {(item.timeline || []).map((event) => (
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
