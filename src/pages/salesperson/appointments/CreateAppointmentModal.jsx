import { useEffect, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Select from '../../../components/common/Select'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { APPOINTMENT_TYPES } from '../../../data/appointments'
import { useToast } from '../../../hooks/useToast'
import { getMyLeads } from '../../../services/api/salespersonPortalService'
import { createSalespersonAppointment } from '../../../services/api/salespersonAppointmentService'

export default function CreateAppointmentModal({ open, onClose, onCreated, defaults = {} }) {
  if (!open) return null
  return (
    <CreateForm
      key={defaults.leadId || 'new'}
      defaults={defaults}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function CreateForm({ defaults, onClose, onCreated }) {
  const { showToast } = useToast()
  const [leads, setLeads] = useState([])
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    customerName: defaults.customerName || '',
    leadId: defaults.leadId || '',
    vehicle: defaults.vehicle || '',
    type: defaults.type || 'Test Drive',
    date: defaults.date || today,
    time: defaults.time || '10:00',
    notes: defaults.notes || '',
  })

  useEffect(() => {
    let active = true
    const t = window.setTimeout(async () => {
      try {
        const result = await getMyLeads({ page: 1, limit: 10 })
        if (active) setLeads(result.items)
      } catch (err) {
        if (active) showToast(err.message || 'Unable to load leads.', 'error')
      }
    }, 0)
    return () => {
      active = false
      window.clearTimeout(t)
    }
  }, [showToast])

  const onLeadChange = (leadId) => {
    const lead = leads.find((l) => l.id === leadId)
    setForm((prev) => ({
      ...prev,
      leadId,
      customerName: lead?.customerName || prev.customerName,
      vehicle: lead?.vehicle || prev.vehicle,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await createSalespersonAppointment(form)
      await onCreated?.(created)
    } catch (err) {
      showToast(err.message || 'Unable to schedule appointment.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="New Appointment" className="max-w-2xl">
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Lead"
          value={form.leadId}
          onChange={(e) => onLeadChange(e.target.value)}
          options={[
            { value: '', label: 'Select lead (optional)' },
            ...leads.map((l) => ({
              value: l.id,
              label: `${l.id} · ${l.customerName}`,
            })),
          ]}
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Customer"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Vehicle"
          value={form.vehicle}
          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          required
          containerClassName="sm:col-span-2"
        />
        <Select
          label="Appointment Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={APPOINTMENT_TYPES}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Input
          label="Time"
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Notes</label>
          <textarea
            className="input-field min-h-20"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Scheduling…
              </>
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
