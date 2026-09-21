import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Car, Clock, Globe2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerDashboard,
} from '../../services/api/inventoryManagerService'

export default function MerchandisingDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getInventoryManagerDashboard())
    } catch (err) {
      setData({
        dealership: user?.dealership || '',
        subtitle: '',
        needsPhotos: 0,
        processed: 0,
        live: 0,
        aged: 0,
        inventory: [],
      })
      showToast(err.message || 'Unable to load inventory dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, user?.dealership])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader
        title="Merchandising"
        description={
          data.subtitle ||
          `${data.dealership || user?.dealership || 'Inventory'} · Photos, listings, and aged stock`
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Needs Photos" value={data.needsPhotos} icon={Camera} />
        <StatCard label="Processed" value={data.processed} icon={Car} />
        <StatCard label="Live" value={data.live} icon={Globe2} />
        <StatCard label="Aged (21+ days)" value={data.aged} icon={Clock} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Inventory snapshot</h2>
          <Link to="/merchandising/inventory">
            <Button size="sm" variant="secondary">
              View inventory
            </Button>
          </Link>
        </div>
        {data.inventory.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No vehicles.</p>
        ) : (
          <ul className="space-y-2">
            {data.inventory.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/merchandising/inventory/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5 hover:bg-[var(--bg-muted)]"
                >
                  <div>
                    <p className="text-sm font-medium">{item.vehicle}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.stockNumber} · {item.daysInStock} days · {formatMoney(item.price)}
                    </p>
                  </div>
                  <StatusBadge status={item.merchStatus} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
