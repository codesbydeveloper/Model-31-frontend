import { useCallback, useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import DataTable from '../../components/common/DataTable'
import salespersonService from '../../services/mock/salespersonService'

export default function DealershipSalespeoplePage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await salespersonService.getSalespeople()
      setRows(data)
    } finally {
      setLoading(false)
    }
  }, [])

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
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Dealership', to: '/dealership/dashboard' },
          { label: 'Salespeople' },
        ]}
      />
      <PageHeader
        title="Salespeople"
        description="Dealership sales team presence and performance."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No salespeople"
          description="Add salespeople to your dealership roster."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <DataTable columns={columns} rows={rows} />
        </Card>
      )}
    </div>
  )
}
