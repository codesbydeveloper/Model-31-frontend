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
  getInventoryManagerPhotos,
} from '../../services/api/inventoryManagerService'

export default function MerchandisingPhotosPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getInventoryManagerPhotos())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load vehicles needing photos.', 'error')
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
        title="Needs Photos"
        description="Vehicles that still need photo work."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No vehicles waiting on photos."
            columns={[
              { key: 'stockNumber', label: 'Stock #' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'photoCount', label: 'Photos' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => formatMoney(row.price),
              },
              { key: 'daysInStock', label: 'Days' },
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
