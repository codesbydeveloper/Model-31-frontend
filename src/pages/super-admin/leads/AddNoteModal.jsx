import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import leadService from '../../../services/mock/leadService'

export default function AddNoteModal({ open, lead, onClose, onSaved }) {
  if (!open || !lead) return null

  return (
    <AddNoteForm
      key={lead.id}
      lead={lead}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}

function AddNoteForm({ lead, onClose, onSaved }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    try {
      await leadService.addLeadNote(lead.id, note.trim())
      await onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Add Note">
      <form onSubmit={submit}>
        <label className="mb-1.5 block text-sm font-medium">Internal note</label>
        <textarea
          className="input-field min-h-28"
          placeholder="Enter internal note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !note.trim()}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Save Note'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
