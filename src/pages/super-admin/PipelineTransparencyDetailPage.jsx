import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import PipelineBadge from '../../components/common/PipelineBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { useToast } from '../../hooks/useToast'
import { PIPELINE_TYPES } from '../../utils/pipeline'
import { getPipelineLead } from '../../services/api/superAdminPipelineTransparencyService'

export default function PipelineTransparencyDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setItem(await getPipelineLead(id))
    } catch (err) {
      setItem(null)
      setError(err.status !== 404)
      showToast(err.message || 'Unable to load lead.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

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

  if (error) {
    return <ErrorState onRetry={load} />
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Lead not found</h1>
        <Link to="/super-admin/pipeline-transparency" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const isModel31 = item.pipelineType === PIPELINE_TYPES.MODEL31

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/pipeline-transparency">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.customerName}
        description={item.id}
        actions={
          <div className="flex flex-wrap gap-2">
            <PipelineBadge pipelineType={item.pipelineType} />
            <StatusBadge status={item.status} />
          </div>
        }
      />

      <Card>
        <h2 className="mb-3 text-base font-semibold">Lead Classification</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Lead ID" value={item.id} />
          <Row label="Customer" value={item.customerName} />
          <Row label="Email" value={item.email || '—'} />
          <Row label="Source" value={item.source} />
          <Row label="Classification" value={item.classificationStatus} />
          <Row label="Salesperson" value={item.salesperson} />
          <Row label="Created" value={item.createdLabel} />
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--text-secondary)]">Model 31 Signature</dt>
            <dd>
              <StatusBadge status={item.model31_signature} />
            </dd>
          </div>
        </dl>

        {isModel31 ? (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] p-3">
            <p className="mb-2 text-sm font-semibold text-[var(--brand-primary)]">
              Model 31 Fingerprint
            </p>
            <dl className="space-y-2 text-sm">
              <Row label="Tracking ID" value={item.trackingId || '—'} />
              <Row label="Content ID" value={item.contentId || '—'} />
              <Row label="Social Origin" value={item.socialOrigin || '—'} />
              <Row label="Engagement Type" value={item.engagementType || '—'} />
              <Row label="Salesperson Profile" value={item.salespersonProfileId || '—'} />
            </dl>
          </div>
        ) : (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] p-3">
            <p className="text-sm font-semibold">Dealership Lead</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Model 31 Access: {item.model31Access || 'READ ONLY'}
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {item.note || 'Model 31 does not modify dealership leads.'}
            </p>
          </div>
        )}
      </Card>

      {item.flow?.length ? (
        <Card className="mt-4">
          <h2 className="mb-3 text-base font-semibold">Lead Flow</h2>
          <ol className="space-y-2 text-sm">
            {item.flow.map((step, index) => (
              <li key={`${step.step}-${index}`}>
                <p className="font-medium">
                  {index + 1}. {step.step}
                </p>
                {step.detail ? (
                  <p className="text-[var(--text-secondary)]">{step.detail}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </Card>
      ) : null}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
