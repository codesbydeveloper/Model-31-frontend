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
import ErrorState from '../../components/ui/ErrorState'
import { useToast } from '../../hooks/useToast'
import {
  getNegotiationLimit,
  saveNegotiationLimit,
} from '../../services/api/superAdminNegotiationControlService'

const DEFAULT_STATUSES = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
]

export default function NegotiationLimitDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const editing = params.get('edit') === '1'
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setItem(await getNegotiationLimit(id, { edit: editing }))
    } catch (err) {
      setItem(null)
      setError(err.status !== 404)
      showToast(err.message || 'Unable to load negotiation limits.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, editing, showToast])

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

  if (error) {
    return <ErrorState onRetry={load} />
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
  const statusOptions = (item.statusOptions || []).length
    ? item.statusOptions.map((status) => ({ value: status, label: status }))
    : DEFAULT_STATUSES

  const onSave = async (event) => {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const saved = await saveNegotiationLimit(id, item)
      setItem(saved)
      showToast('Limits saved.')
    } catch (err) {
      showToast(err.message || 'Unable to save limits.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link to="/super-admin/negotiation-control">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
        {editing ? (
          <Link to={`/super-admin/negotiation-control/${id}`}>
            <Button size="sm" variant="secondary">
              View
            </Button>
          </Link>
        ) : (
          <Link to={`/super-admin/negotiation-control/${id}?edit=1`}>
            <Button size="sm">Edit</Button>
          </Link>
        )}
      </div>
      <PageHeader
        title={item.vehicle}
        description={`${item.vin} · ${editing ? 'Edit limits' : 'Negotiation limits'}`}
        actions={<StatusBadge status={item.status} />}
      />
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Model 31 cannot negotiate outside manager-defined limits. If negotiation
        limits are not configured, price negotiation is unavailable.
      </div>
      <Card>
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={onSave}>
          <Input
            label="Vehicle"
            value={item.vehicle}
            disabled={!editing}
            onChange={(e) => update('vehicle', e.target.value)}
          />
          <Input
            label="VIN"
            value={item.vin}
            disabled={!editing}
            onChange={(e) => update('vin', e.target.value)}
          />
          <Input
            label="MSRP"
            type="number"
            value={item.msrp}
            disabled={!editing}
            onChange={(e) => update('msrp', e.target.value)}
          />
          <Input
            label="Current Price"
            type="number"
            value={item.currentPrice}
            disabled={!editing}
            onChange={(e) => update('currentPrice', e.target.value)}
          />
          <Input
            label="Minimum Price"
            type="number"
            value={item.minPrice}
            disabled={!editing}
            onChange={(e) => update('minPrice', e.target.value)}
          />
          <Input
            label="Maximum Discount"
            type="number"
            value={item.maxDiscount}
            disabled={!editing}
            onChange={(e) => update('maxDiscount', e.target.value)}
          />
          <Input
            label="Minimum Payment"
            type="number"
            value={item.paymentMin}
            disabled={!editing}
            onChange={(e) => update('paymentMin', e.target.value)}
          />
          <Input
            label="Maximum Payment"
            type="number"
            value={item.paymentMax}
            disabled={!editing}
            onChange={(e) => update('paymentMax', e.target.value)}
          />
          <Input
            label="Minimum Trade Value"
            type="number"
            value={item.tradeMin}
            disabled={!editing}
            onChange={(e) => update('tradeMin', e.target.value)}
          />
          <Input
            label="Maximum Trade Value"
            type="number"
            value={item.tradeMax}
            disabled={!editing}
            onChange={(e) => update('tradeMax', e.target.value)}
          />
          <Input
            label="Allowed Incentives"
            value={item.allowedIncentives || ''}
            disabled={!editing}
            onChange={(e) => update('allowedIncentives', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Allowed Fees"
            value={item.allowedFees || ''}
            disabled={!editing}
            onChange={(e) => update('allowedFees', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Status"
            value={item.status}
            disabled={!editing}
            onChange={(e) => update('status', e.target.value)}
            options={statusOptions}
          />
          {editing ? (
            <div className="flex items-end">
              <Button type="submit" disabled={saving}>
                {saving ? <LoadingSpinner size={16} /> : 'Save Changes'}
              </Button>
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  )
}
