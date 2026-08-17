import Card from '../common/Card'
import PipelineBadge from '../common/PipelineBadge'
import StatusBadge from '../common/StatusBadge'
import { PIPELINE_TYPES, classifyLead } from '../../utils/pipeline'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--text-primary)]">{value || '—'}</dd>
    </div>
  )
}

export default function LeadClassificationCard({ lead }) {
  if (!lead) return null
  const classified = classifyLead(lead)
  const isModel31 = classified.pipelineType === PIPELINE_TYPES.MODEL31

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold">Lead Classification</h2>
      <dl className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <dt className="text-[var(--text-secondary)]">Pipeline</dt>
          <dd>
            <PipelineBadge pipelineType={classified.pipelineType} />
          </dd>
        </div>
        <Row label="Source" value={classified.source} />
        <Row label="Classification" value={classified.classificationStatus} />
      </dl>

      {isModel31 ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] p-3">
          <p className="mb-2 text-sm font-semibold text-[var(--brand-primary)]">
            Model 31 Fingerprint
          </p>
          <dl className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-[var(--text-secondary)]">Model 31 Signature</dt>
              <dd>
                <StatusBadge status="✓ VERIFIED" />
              </dd>
            </div>
            <Row label="Tracking ID" value={classified.model31_tracking_id} />
            <Row label="Content ID" value={classified.content_id} />
            <Row label="Social Origin" value={classified.social_origin} />
            <Row label="Engagement Type" value={classified.engagement_type} />
            <Row label="Salesperson Profile" value={classified.salesperson_profile_id} />
            <Row
              label="Created"
              value={classified.createdLabel || classified.timestamp}
            />
          </dl>
        </div>
      ) : (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] p-3">
          <p className="text-sm font-semibold">Dealership Lead</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">CRM Read-Only</p>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Model 31 Signature</span>
            <StatusBadge status="NOT APPLICABLE" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Model 31 Access</span>
            <span className="font-medium">READ ONLY</span>
          </div>
          <p
            className="mt-2 text-xs text-[var(--text-muted)]"
            title="Model 31 does not modify dealership leads."
          >
            Model 31 does not modify dealership leads.
          </p>
        </div>
      )}
    </Card>
  )
}
