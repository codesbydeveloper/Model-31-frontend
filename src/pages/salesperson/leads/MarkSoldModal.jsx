import { useMemo, useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { calculateCommission } from '../../../data/commission'
import { createSoldDeal } from '../../../services/mock/soldDealService'
import salespersonService from '../../../services/mock/salespersonService'

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`
}

export default function MarkSoldModal({ open, lead, onClose, onSold }) {
  if (!open || !lead) return null
  return <SoldForm key={lead.id} lead={lead} onClose={onClose} onSold={onSold} />
}

function SoldForm({ lead, onClose, onSold }) {
  const [form, setForm] = useState({
    salePrice: '',
    vehicle: lead.vehicle || '',
    saleDate: '2026-08-14',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const preview = useMemo(
    () => calculateCommission(form.salePrice),
    [form.salePrice],
  )

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSoldDeal({
        leadId: lead.id,
        customerName: lead.customerName,
        vehicle: form.vehicle,
        dealership: lead.dealership,
        salesperson: 'John Smith',
        salespersonId: 'sp_001',
        salePrice: form.salePrice,
        saleDate: form.saleDate,
        notes: form.notes,
      })
      await salespersonService.updateMyLeadStatus(lead.id, 'SOLD')
      await onSold?.(preview)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Mark Lead as Sold" className="max-w-lg">
      <form onSubmit={submit} className="grid gap-3">
        <Input label="Customer" value={lead.customerName} readOnly />
        <Input
          label="Vehicle"
          value={form.vehicle}
          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          required
        />
        <Input
          label="Sale Price"
          type="number"
          min="0"
          value={form.salePrice}
          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
          required
        />
        <Input
          label="Sale Date"
          type="date"
          value={form.saleDate}
          onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
          required
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Notes</label>
          <textarea
            className="input-field min-h-20"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-4 text-sm">
          <p className="font-semibold">Commission preview</p>
          <p className="mt-2">Deal Amount {money(preview.dealAmount)}</p>
          <p>× {(preview.commissionRate * 100).toFixed(1)}%</p>
          <p className="mt-1">Base Commission {money(preview.baseCommission)}</p>
          <p>Bonus {money(preview.bonus)}</p>
          <p className="mt-2 font-semibold">
            Total Commission {money(preview.totalCommission)}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !form.salePrice}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Mark Sold'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
