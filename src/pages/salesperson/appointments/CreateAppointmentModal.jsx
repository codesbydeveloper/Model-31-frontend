import { useEffect, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Select from '../../../components/common/Select'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import {
  APPOINTMENT_TYPES,
} from '../../../data/appointments'
import appointmentService from '../../../services/mock/appointmentService'
import salespersonService from '../../../services/mock/salespersonService'

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
  const [leads, setLeads] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    customerName: defaults.customerName || '',
    leadId: defaults.leadId || '',
    vehicle: defaults.vehicle || '',
    type: defaults.type || 'Test Drive',
    date: defaults.date || '2026-08-16',
    time: defaults.time || '10:00',
    dealership: defaults.dealership || 'Miami Luxury Motors',
    notes: defaults.notes || '',
    phone: defaults.phone || '',
    email: defaults.email || '',
  })

  useEffect(() => {
    let active = true
    const t = window.setTimeout(async () => {
      const rows = await salespersonService.getMyLeads('sp_001')
      if (active) setLeads(rows)
    }, 0)
    return () => {
      active = false
      window.clearTimeout(t)
    }
  }, [])

  const onLeadChange = (leadId) => {
    const lead = leads.find((l) => l.id === leadId)
    setForm((prev) => ({
      ...prev,
      leadId,
      customerName: lead?.customerName || prev.customerName,
      vehicle: lead?.vehicle || prev.vehicle,
      phone: lead?.phone || prev.phone,
      email: lead?.email || prev.email,
      dealership: lead?.dealership || prev.dealership,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await appointmentService.createAppointment({
        ...form,
        salesperson: 'John Smith',
        salespersonId: 'sp_001',
      })
      await onCreated?.(created)
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
          label="Dealership"
          value={form.dealership}
          onChange={(e) => setForm({ ...form, dealership: e.target.value })}
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
