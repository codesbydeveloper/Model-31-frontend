import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import PipelineBadge from '../common/PipelineBadge'
import LoadingSpinner from '../common/LoadingSpinner'
import { PIPELINE_TYPES } from '../../utils/pipeline'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}

function pipelineFromBadges(badges = []) {
  const joined = badges.join(' ').toUpperCase().replace(/\s+/g, '')
  if (joined.includes('MODEL31')) return PIPELINE_TYPES.MODEL31
  return PIPELINE_TYPES.DEALERSHIP
}

export default function FingerprintViewer({ open, fingerprint, loading, onClose }) {
  if (!open) return null
  const print = fingerprint || {}
  const details = print.details || {}
  const badges = print.badges || []
  const pipelineType = pipelineFromBadges(badges)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fingerprint Viewer"
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {loading || !fingerprint ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <PipelineBadge pipelineType={pipelineType} />
            {badges.map((badge) => (
              <StatusBadge key={badge} status={badge} />
            ))}
          </div>

          <ol className="mb-5 space-y-2">
            {(print.timeline || []).map((stage, index, list) => (
              <li key={`${stage.step}-${index}`}>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {stage.step}
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{stage.value}</p>
                </div>
                {index < list.length - 1 && (
                  <p className="py-1 text-center text-xs text-[var(--text-muted)]">↓</p>
                )}
              </li>
            ))}
          </ol>

          <dl className="space-y-2">
            <Row label="Content ID" value={details.contentId} />
            <Row label="Lead ID" value={details.leadId || print.leadId} />
            <Row label="Source" value={details.source} />
            <Row label="Engagement timestamp" value={details.engagementTimestamp} />
            <Row label="Conversation timestamp" value={details.conversationTimestamp} />
            <Row label="Lead qualification" value={details.leadQualification} />
            <Row label="Dispatch timestamp" value={details.dispatchTimestamp} />
            <Row label="Assigned salesperson" value={details.assignedSalesperson} />
            <Row label="Appointment" value={details.appointment} />
            <Row label="Sale status" value={details.saleStatus} />
            {details.model31Access ? (
              <Row label="Model 31 Access" value={details.model31Access} />
            ) : null}
          </dl>
        </>
      )}
    </Modal>
  )
}
