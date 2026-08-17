import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { useToast } from '../../hooks/useToast'
import negotiationService from '../../services/mock/negotiationService'

const EMPTY = {
  name: '',
  description: '',
  vehicleType: 'New',
  minPriceRule: '',
  maxDiscountRule: '',
  paymentRange: '',
  tradeRange: '',
  allowedIncentives: '',
  allowedFees: '',
  status: 'ACTIVE',
}

export default function NegotiationTemplatesPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await negotiationService.getNegotiationTemplates())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Negotiation Templates"
        description="Reusable manager-defined price, payment and trade rules."
        actions={
          <Button
            onClick={() => {
              setForm(EMPTY)
              setOpen(true)
            }}
          >
            Create Template
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[var(--text-muted)]">Vehicle Count</dt>
                  <dd className="font-medium">{item.vehicleCount}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Price Rules</dt>
                  <dd className="font-medium">{item.minPriceRule}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Payment Rules</dt>
                  <dd className="font-medium">{item.paymentRange}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Trade Rules</dt>
                  <dd className="font-medium">{item.tradeRange}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[var(--text-muted)]">Last Updated</dt>
                  <dd className="font-medium">{item.lastUpdated}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/super-admin/negotiation-templates/${item.id}`}>
                  <Button size="sm">View</Button>
                </Link>
                <Link to={`/super-admin/negotiation-templates/${item.id}?edit=1`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await negotiationService.duplicateNegotiationTemplate(item.id)
                    showToast('Template duplicated.')
                    await load()
                  }}
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await negotiationService.updateNegotiationTemplate(item.id, {
                      status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    })
                    showToast(
                      item.status === 'ACTIVE' ? 'Template deactivated.' : 'Template activated.',
                    )
                    await load()
                  }}
                >
                  {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Template" className="max-w-2xl">
        <form
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            try {
              await negotiationService.createNegotiationTemplate({
                ...form,
                allowedIncentives: form.allowedIncentives.split(',').map((s) => s.trim()).filter(Boolean),
                allowedFees: form.allowedFees.split(',').map((s) => s.trim()).filter(Boolean),
              })
              setOpen(false)
              showToast('Template created (mock).')
              await load()
            } finally {
              setSaving(false)
            }
          }}
        >
          <Input label="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required containerClassName="sm:col-span-2" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} containerClassName="sm:col-span-2" />
          <Select
            label="Vehicle Type"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            options={['New', 'Used', 'Certified Used', 'EV', 'Aged']}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['ACTIVE', 'INACTIVE']}
          />
          <Input label="Minimum Price Rule" value={form.minPriceRule} onChange={(e) => setForm({ ...form, minPriceRule: e.target.value })} />
          <Input label="Maximum Discount Rule" value={form.maxDiscountRule} onChange={(e) => setForm({ ...form, maxDiscountRule: e.target.value })} />
          <Input label="Payment Range" value={form.paymentRange} onChange={(e) => setForm({ ...form, paymentRange: e.target.value })} />
          <Input label="Trade Range" value={form.tradeRange} onChange={(e) => setForm({ ...form, tradeRange: e.target.value })} />
          <Input label="Allowed Incentives" value={form.allowedIncentives} onChange={(e) => setForm({ ...form, allowedIncentives: e.target.value })} containerClassName="sm:col-span-2" />
          <Input label="Allowed Fees" value={form.allowedFees} onChange={(e) => setForm({ ...form, allowedFees: e.target.value })} containerClassName="sm:col-span-2" />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
