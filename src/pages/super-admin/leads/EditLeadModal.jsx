import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import leadService from '../../../services/api/leadService'
import { useToast } from '../../../hooks/useToast'

export default function EditLeadModal({ open, lead, onClose, onSaved }) {
  if (!open || !lead) return null

  return (
    <EditLeadForm
      key={lead.id}
      lead={lead}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}

function EditLeadForm({ lead, onClose, onSaved }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    customerName: lead.customerName || '',
    phone: lead.phone || '',
    email: lead.email || '',
    vehicle: lead.vehicle || '',
    budget: lead.budget || '',
    timeline: lead.timeline || '',
    location: lead.location || '',
    financing: lead.financing || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.customerName.trim()) next.customerName = 'Customer name is required.'
    if (!form.vehicle.trim()) next.vehicle = 'Vehicle is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await leadService.updateLead(lead.id, form)
      await onSaved?.()
    } catch (err) {
      showToast(err.message || 'Unable to update lead.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      title="Edit Lead"
      className="max-w-2xl"
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Customer Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          error={errors.customerName}
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Vehicle"
          value={form.vehicle}
          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          error={errors.vehicle}
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Budget"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <Input
          label="Timeline"
          value={form.timeline}
          onChange={(e) => setForm({ ...form, timeline: e.target.value })}
        />
        <Input
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <Input
          label="Financing"
          value={form.financing}
          onChange={(e) => setForm({ ...form, financing: e.target.value })}
        />
        <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Save Lead'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
