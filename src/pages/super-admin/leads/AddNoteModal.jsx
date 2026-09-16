import { useEffect, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import leadService from '../../../services/api/leadService'
import { useToast } from '../../../hooks/useToast'

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
  const { showToast } = useToast()
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const rows = await leadService.getLeadNotes(lead.id)
        if (active) setNotes(rows)
      } catch (err) {
        if (active) {
          setNotes(Array.isArray(lead.notes) ? lead.notes : [])
          showToast(err.message || 'Unable to load notes.', 'error')
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [lead.id, lead.notes, showToast])

  const submit = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    try {
      await leadService.addLeadNote(lead.id, note.trim())
      setNote('')
      const rows = await leadService.getLeadNotes(lead.id).catch(() => null)
      if (rows) setNotes(rows)
      await onSaved?.()
    } catch (err) {
      showToast(err.message || 'Unable to save note.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Add Note">
      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={24} />
        </div>
      ) : notes.length > 0 ? (
        <ul className="mb-4 max-h-40 space-y-2 overflow-y-auto">
          {notes.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
            >
              <p>{item.text}</p>
              {(item.author || item.time) && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {[item.author, item.time].filter(Boolean).join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-[var(--text-secondary)]">No notes yet.</p>
      )}

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
