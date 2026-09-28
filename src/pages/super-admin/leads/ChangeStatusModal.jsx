import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Select from '../../../components/common/Select'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { LEAD_STATUSES } from '../../../data/leads'
import leadService from '../../../services/api/leadService'
import { useToast } from '../../../hooks/useToast'
import { statusGuardMessage } from '../../../utils/statusGuard'

export default function ChangeStatusModal({ open, lead, onClose, onChanged }) {
  if (!open || !lead) return null

  return (
    <ChangeStatusForm
      key={`${lead.id}-${lead.status}`}
      lead={lead}
      onClose={onClose}
      onChanged={onChanged}
    />
  )
}

function ChangeStatusForm({ lead, onClose, onChanged }) {
  const { showToast } = useToast()
  const [status, setStatus] = useState(lead.status)
  const [saving, setSaving] = useState(false)
  const [guardMessage, setGuardMessage] = useState('')

  const submit = async () => {
    setSaving(true)
    setGuardMessage('')
    try {
      await leadService.updateLeadStatus(lead.id, status)
      await onChanged?.()
    } catch (err) {
      const blocked = statusGuardMessage(err)
      if (blocked) {
        setGuardMessage(blocked)
        showToast(blocked, 'error')
        await onChanged?.()
        return
      }
      showToast(err.message || 'Unable to change status.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Change Status">
      {guardMessage ? (
        <div
          role="alert"
          className="mb-3 rounded-[var(--radius-md)] border border-[var(--status-error)]/30 bg-[var(--status-error-bg)] px-3 py-2.5 text-sm text-[var(--status-error)]"
        >
          {guardMessage}
        </div>
      ) : null}
      <Select
        label="Lead Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={LEAD_STATUSES}
      />
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? (
            <>
              <LoadingSpinner size={16} />
              Saving…
            </>
          ) : (
            'Update Status'
          )}
        </Button>
      </div>
    </Modal>
  )
}
