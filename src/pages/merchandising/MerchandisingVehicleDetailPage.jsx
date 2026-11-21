import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerVehicle,
} from '../../services/api/inventoryManagerService'

function Field({ label, value }) {
  const text = value == null || value === '' ? '—' : String(value)
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-app)] px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{text}</dd>
    </div>
  )
}

export default function MerchandisingVehicleDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await getInventoryManagerVehicle(id))
    } catch (err) {
      setItem(null)
      showToast(err.message || 'Unable to load vehicle.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

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
        <h1 className="text-xl font-semibold">Vehicle not found</h1>
        <Link to="/merchandising/inventory" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/merchandising/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader title={item.vehicle || 'Vehicle'} />
      <Card>
        <h2 className="mb-4 text-base font-semibold">Vehicle</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="VIN" value={item.vin} />
          <Field label="Year" value={item.year} />
          <Field label="Make" value={item.make} />
          <Field label="Model" value={item.model} />
          <Field label="Price" value={formatMoney(item.price)} />
          <Field label="Trim" value={item.trim} />
          <Field label="Mileage" value={item.mileage === '' || item.mileage == null ? '' : Number(item.mileage).toLocaleString('en-US')} />
          <Field label="Color" value={item.color} />
          <Field label="Stock Number" value={item.stockNumber} />
        </dl>
      </Card>
    </div>
  )
}
