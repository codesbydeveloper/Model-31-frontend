import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { getInventoryById } from '../../services/api/superAdminInventoryService'

export default function InventoryDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await getInventoryById(id))
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
        <Link to="/super-admin/inventory" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.vehicle}
        description={`${item.vin} · ${item.dealership}`}
        actions={<StatusBadge status={item.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Vehicle Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="VIN" value={item.vin} />
            <Row label="Year" value={item.year} />
            <Row label="Make" value={item.make} />
            <Row label="Model" value={item.model} />
            <Row label="Trim" value={item.trim} />
            <Row label="Price" value={`$${formatNumber(item.price)}`} />
            <Row label="Mileage" value={`${formatNumber(item.mileage)} mi`} />
            <Row label="Color" value={item.color} />
            <Row label="Dealership" value={item.dealership} />
            <Row label="Availability" value={item.status} />
            <Row label="Days in Inventory" value={item.daysInInventory} />
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold">Price History</h2>
          <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">Original → Current</p>
            <p className="mt-2 text-xl font-semibold">
              ${formatNumber(item.originalPrice)} → ${formatNumber(item.price)}
            </p>
            {item.priceChangeDate && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Changed {item.priceChangeDate}
              </p>
            )}
          </div>
          {(item.priceHistory || []).length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No price history yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {item.priceHistory.map((p) => (
                <li
                  key={`${p.date}-${p.label}`}
                  className="flex justify-between rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
                >
                  <span>
                    {p.label} · {p.date}
                  </span>
                  <span className="font-medium">${formatNumber(p.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-semibold">Inventory History</h2>
        {(item.inventoryHistory || []).length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No inventory history yet.</p>
        ) : (
          <ul className="space-y-2">
            {item.inventoryHistory.map((h, idx) => (
              <li
                key={h.id || `${h.date}-${idx}`}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
              >
                <p className="font-medium">{h.event}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {h.actor} · {h.date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
