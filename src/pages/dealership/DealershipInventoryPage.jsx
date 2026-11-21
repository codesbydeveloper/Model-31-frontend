import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import {
  formatMoney,
  getInventoryManagerInventoryPage,
} from '../../services/api/inventoryManagerService'

const PAGE_SIZE = 10

export default function DealershipInventoryPage() {
  const { showToast } = useToast()
  const [cars, setCars] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getInventoryManagerInventoryPage({ page, limit: PAGE_SIZE })
      setCars(result.items)
      setTotal(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setCars([])
      setTotal(0)
      showToast(err.message || 'Unable to load inventory.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader
        title="Inventory"
        description="Cars saved for this dealership. This is the same inventory the AI uses."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={cars.map((car, index) => ({
              ...car,
              srNo: (page - 1) * PAGE_SIZE + index + 1,
            }))}
            rowKey="id"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={total}
            onPageChange={setPage}
            showPagination={total > PAGE_SIZE}
            emptyTitle="No vehicles."
            emptyDescription="Cars added for this dealership will appear here."
            columns={[
              {
                key: 'srNo',
                label: 'Sr No',
                className: 'text-center',
                cellClassName: 'text-center',
              },
              {
                key: 'vin',
                label: 'VIN',
                className: 'text-center',
                cellClassName: 'text-center',
                render: (row) => row.vin || '—',
              },
              { key: 'year', label: 'Year', render: (row) => row.year || '—' },
              { key: 'make', label: 'Make', render: (row) => row.make || '—' },
              { key: 'model', label: 'Model', render: (row) => row.model || '—' },
              {
                key: 'price',
                label: 'Price',
                render: (row) => formatMoney(row.price),
              },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
