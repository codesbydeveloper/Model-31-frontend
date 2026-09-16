import { useCallback, useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import DataTable from '../../components/common/DataTable'
import { useToast } from '../../hooks/useToast'
import dealershipSalespersonService from '../../services/api/dealershipSalespersonService'

const PAGE_SIZE = 10

export default function DealershipSalespeoplePage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dealershipSalespersonService.getDealershipSalespeople({
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load salespeople.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Presence',
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: 'assigned', label: 'Assigned' },
    { key: 'sold', label: 'Sold' },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading salespeople…" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Breadcrumbs />
      <PageHeader
        title="Salespeople"
        description="Dealership sales team presence and performance."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No salespeople"
          description="Salespeople for this dealership will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <DataTable
            columns={columns}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            onPageChange={setPage}
          />
        </Card>
      )}
    </div>
  )
}
