import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import PipelineBadge from '../common/PipelineBadge'
import { PIPELINE_TYPES } from '../../utils/pipeline'
import { buildFingerprint } from '../../services/mock/commandCenterService'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}

export default function FingerprintViewer({ open, lead, onClose }) {
  if (!open || !lead) return null
  const print = buildFingerprint(lead)
  const isModel31 = print.pipelineType === PIPELINE_TYPES.MODEL31

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fingerprint Viewer"
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PipelineBadge pipelineType={print.pipelineType} />
        <StatusBadge status={print.signature} />
      </div>

      <ol className="mb-5 space-y-2">
        {print.stages.map((stage, index) => (
          <li key={stage.key}>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {stage.label}
              </p>
              <p className="mt-0.5 text-sm font-medium">{stage.detail}</p>
            </div>
            {index < print.stages.length - 1 && (
              <p className="py-1 text-center text-xs text-[var(--text-muted)]">↓</p>
            )}
          </li>
        ))}
      </ol>

      <dl className="space-y-2">
        <Row label="Content ID" value={print.contentId} />
        <Row label="Lead ID" value={print.leadId} />
        <Row label="Source" value={print.source} />
        <Row label="Engagement timestamp" value={print.engagementTimestamp} />
        <Row label="Conversation timestamp" value={print.conversationTimestamp} />
        <Row label="Lead qualification" value={print.qualification} />
        <Row label="Dispatch timestamp" value={print.dispatchTimestamp} />
        <Row label="Assigned salesperson" value={print.salesperson} />
        <Row label="Appointment" value={print.appointment} />
        <Row label="Sale status" value={print.saleStatus} />
        {!isModel31 && (
          <Row label="Model 31 Access" value="READ ONLY" />
        )}
      </dl>
    </Modal>
  )
}
