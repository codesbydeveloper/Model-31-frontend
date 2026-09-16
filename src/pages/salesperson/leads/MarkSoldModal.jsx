import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../hooks/useToast'
import { markMyLeadSold } from '../../../services/api/salespersonPortalService'

export default function MarkSoldModal({ open, lead, onClose, onSold }) {
  if (!open || !lead) return null
  return <SoldForm key={lead.id} lead={lead} onClose={onClose} onSold={onSold} />
}

function SoldForm({ lead, onClose, onSold }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    dealAmount: '',
    paymentMethod: 'Cash + trade-in',
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await markMyLeadSold(lead.id, {
        dealAmount: Number(form.dealAmount) || 0,
        paymentMethod: form.paymentMethod.trim(),
      })
      await onSold?.()
    } catch (err) {
      showToast(err.message || 'Unable to mark sold.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={saving ? () => {} : onClose} title="Mark Lead as Sold" className="max-w-lg">
      <form onSubmit={submit} className="grid gap-3">
        <Input label="Customer" value={lead.customerName} readOnly />
        <Input label="Vehicle" value={lead.vehicle || ''} readOnly />
        <Input
          label="Deal Amount"
          type="number"
          min="0"
          value={form.dealAmount}
          onChange={(e) => setForm({ ...form, dealAmount: e.target.value })}
          required
        />
        <Input
          label="Payment Method"
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          required
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !form.dealAmount}>
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
