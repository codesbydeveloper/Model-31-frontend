import { useEffect, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import StatusBadge from '../../../components/common/StatusBadge'
import userService from '../../../services/api/userService'
import leadService from '../../../services/api/leadService'
import { useToast } from '../../../hooks/useToast'

export default function AssignSalespersonModal({
  open,
  lead,
  onClose,
  onAssigned,
}) {
  if (!open || !lead) return null

  return (
    <AssignForm
      key={lead.id}
      lead={lead}
      onClose={onClose}
      onAssigned={onAssigned}
    />
  )
}

function AssignForm({ lead, onClose, onAssigned }) {
  const { showToast } = useToast()
  const [people, setPeople] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const rows = await userService.getSalespeople()
        if (!active) return
        setPeople(rows)
      } catch (err) {
        if (!active) return
        setPeople([])
        showToast(err.message || 'Unable to load salespeople.', 'error')
      } finally {
        if (active) setLoading(false)
      }
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [showToast])

  const submit = async () => {
    if (!selected?.id) return
    setSaving(true)
    try {
      await leadService.assignLead(lead.id, selected.id)
      await onAssigned?.()
    } catch (err) {
      showToast(err.message || 'Unable to assign salesperson.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const unassign = async () => {
    setSaving(true)
    try {
      await leadService.assignLead(lead.id, null)
      await onAssigned?.()
    } catch (err) {
      showToast(err.message || 'Unable to unassign salesperson.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Assign Salesperson">
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size={24} />
        </div>
      ) : people.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
          No salespeople found.
        </p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelected(person)}
              className={`flex w-full items-start justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors ${
                selected?.id === person.id
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
                  : 'border-[var(--border-default)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {person.dealership} · {person.currentLeads} active leads
                </p>
              </div>
              <StatusBadge status={person.status} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {lead.salespersonId || (lead.salesperson && lead.salesperson !== 'Unassigned') ? (
          <Button variant="secondary" onClick={unassign} disabled={saving}>
            Unassign
          </Button>
        ) : null}
        <Button onClick={submit} disabled={!selected?.id || saving}>
          {saving ? (
            <>
              <LoadingSpinner size={16} />
              Assigning…
            </>
          ) : (
            'Assign'
          )}
        </Button>
      </div>
    </Modal>
  )
}
