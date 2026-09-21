import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerVehicle,
} from '../../services/api/inventoryManagerService'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
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
      <PageHeader
        title={item.vehicle}
        description={`${item.stockNumber} · ${item.dealership}`}
        actions={<StatusBadge status={item.merchStatus} />}
      />
      <Card>
        <h2 className="mb-3 text-base font-semibold">Listing details</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Stock #" value={item.stockNumber} />
          <Row label="VIN" value={item.vin} />
          <Row label="Year" value={item.year} />
          <Row label="Make" value={item.make} />
          <Row label="Model" value={item.model} />
          <Row label="Price" value={formatMoney(item.price)} />
          <Row label="Days in stock" value={item.daysInStock} />
          <Row label="Photos" value={item.photoCount} />
          <Row label="Merch status" value={item.merchStatus} />
        </dl>
      </Card>
    </div>
  )
}
