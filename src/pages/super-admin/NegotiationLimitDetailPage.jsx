import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import negotiationService from '../../services/mock/negotiationService'

export default function NegotiationLimitDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await negotiationService.getNegotiationLimit(id))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Limit not found</h1>
        <Link to="/super-admin/negotiation-control" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const update = (key, value) => setItem((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/negotiation-control">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.vehicle}
        description={`${item.vin} · ${params.get('edit') ? 'Edit limits' : 'Negotiation limits'}`}
        actions={<StatusBadge status={item.status} />}
      />
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Model 31 cannot negotiate outside manager-defined limits. If negotiation
        limits are not configured, price negotiation is unavailable.
      </div>
      <Card>
        <form
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            try {
              const saved = await negotiationService.updateNegotiationLimits(id, {
                ...item,
                minPrice: Number(item.minPrice),
                maxDiscount: Number(item.maxDiscount),
                paymentMin: Number(item.paymentMin),
                paymentMax: Number(item.paymentMax),
                tradeMin: Number(item.tradeMin),
                tradeMax: Number(item.tradeMax),
                msrp: Number(item.msrp),
                currentPrice: Number(item.currentPrice),
              })
              setItem(saved)
              showToast('Limits saved (mock).')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Input label="Vehicle" value={item.vehicle} onChange={(e) => update('vehicle', e.target.value)} />
          <Input label="VIN" value={item.vin} onChange={(e) => update('vin', e.target.value)} />
          <Input label="MSRP" type="number" value={item.msrp} onChange={(e) => update('msrp', e.target.value)} />
          <Input label="Current Price" type="number" value={item.currentPrice} onChange={(e) => update('currentPrice', e.target.value)} />
          <Input label="Minimum Price" type="number" value={item.minPrice} onChange={(e) => update('minPrice', e.target.value)} />
          <Input label="Maximum Discount" type="number" value={item.maxDiscount} onChange={(e) => update('maxDiscount', e.target.value)} />
          <Input label="Minimum Payment" type="number" value={item.paymentMin} onChange={(e) => update('paymentMin', e.target.value)} />
          <Input label="Maximum Payment" type="number" value={item.paymentMax} onChange={(e) => update('paymentMax', e.target.value)} />
          <Input label="Minimum Trade Value" type="number" value={item.tradeMin} onChange={(e) => update('tradeMin', e.target.value)} />
          <Input label="Maximum Trade Value" type="number" value={item.tradeMax} onChange={(e) => update('tradeMax', e.target.value)} />
          <Input
            label="Allowed Incentives"
            value={(item.allowedIncentives || []).join(', ')}
            onChange={(e) => update('allowedIncentives', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Allowed Fees"
            value={(item.allowedFees || []).join(', ')}
            onChange={(e) => update('allowedFees', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Status"
            value={item.status}
            onChange={(e) => update('status', e.target.value)}
            options={[
              { value: 'ACTIVE', label: 'ACTIVE' },
              { value: 'INACTIVE', label: 'INACTIVE' },
            ]}
          />
          <div className="flex items-end">
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
