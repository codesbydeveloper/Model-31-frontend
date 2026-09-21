import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerInventory,
} from '../../services/api/inventoryManagerService'

export default function MerchandisingInventoryPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getInventoryManagerInventory())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load inventory.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader
        title="Merchandising Inventory"
        description="Vehicle photos, price, and listing status."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No vehicles."
            columns={[
              { key: 'stockNumber', label: 'Stock #' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'vin', label: 'VIN' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => formatMoney(row.price),
              },
              { key: 'daysInStock', label: 'Days' },
              { key: 'photoCount', label: 'Photos' },
              {
                key: 'merchStatus',
                label: 'Status',
                render: (row) => <StatusBadge status={row.merchStatus} />,
              },
              {
                key: 'action',
                label: '',
                render: (row) => (
                  <Link to={`/merchandising/inventory/${row.id}`}>
                    <Button size="sm" variant="ghost">
                      Open
                    </Button>
                  </Link>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
