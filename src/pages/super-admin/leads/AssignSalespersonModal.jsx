import { useEffect, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import StatusBadge from '../../../components/common/StatusBadge'
import salespersonService from '../../../services/mock/salespersonService'
import leadService from '../../../services/mock/leadService'

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
  const [people, setPeople] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      const rows = await salespersonService.getSalespeople()
      if (active) {
        setPeople(rows)
        setLoading(false)
      }
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [])

  const submit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await leadService.assignLead(lead.id, selected)
      await onAssigned?.()
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
      ) : (
        <div className="space-y-2">
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
        <Button onClick={submit} disabled={!selected || saving}>
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
