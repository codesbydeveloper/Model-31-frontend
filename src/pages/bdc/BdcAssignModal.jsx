import { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import bdcService from '../../services/mock/bdcService'

export default function BdcAssignModal({
  open,
  lead,
  mode = 'assign',
  onClose,
  onDone,
}) {
  if (!open || !lead) return null
  return (
    <AssignForm
      key={`${mode}-${lead.id}`}
      lead={lead}
      mode={mode}
      onClose={onClose}
      onDone={onDone}
    />
  )
}

function AssignForm({ lead, mode, onClose, onDone }) {
  const [people, setPeople] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      const rows = await bdcService.getSalespeopleAvailability()
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
      if (mode === 'reassign') {
        await bdcService.reassignLead(lead.id, selected)
      } else {
        await bdcService.assignLead(lead.id, selected)
      }
      await onDone?.(selected)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      title={mode === 'reassign' ? 'Reassign Lead' : 'Assign Lead'}
      className="max-w-lg"
    >
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-3 py-3 text-sm">
        <p className="font-semibold">
          {lead.id} · {lead.customerName}
        </p>
        <p className="mt-1 text-[var(--text-secondary)]">
          {lead.vehicle} · Score {lead.score} · Tier {lead.tier}
        </p>
        {mode === 'reassign' && (
          <p className="mt-1 text-[var(--text-secondary)]">
            Current: {lead.salesperson || 'Unassigned'}
          </p>
        )}
      </div>

      <p className="mb-2 text-sm font-medium">Available Salespeople</p>
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size={24} />
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelected(person)}
              className={`flex w-full items-start justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left ${
                selected?.id === person.id
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
                  : 'border-[var(--border-default)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
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
              Saving…
            </>
          ) : mode === 'reassign' ? (
            'Reassign Lead'
          ) : (
            'Assign Lead'
          )}
        </Button>
      </div>
    </Modal>
  )
}
