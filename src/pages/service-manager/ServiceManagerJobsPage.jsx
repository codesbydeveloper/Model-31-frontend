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
import { formatMoney } from '../../data/demoServiceRoles'
import { getServiceManagerJobs } from '../../services/api/serviceManagerService'

export default function ServiceManagerJobsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getServiceManagerJobs())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load repair orders.', 'error')
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
        title="Shop Repair Orders"
        description="All open and completed service jobs."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No repair orders."
            columns={[
              { key: 'roNumber', label: 'RO #' },
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'advisorName', label: 'Advisor' },
              { key: 'technicianName', label: 'Technician' },
              {
                key: 'statusLabel',
                label: 'Status',
                render: (row) => <StatusBadge status={row.statusLabel} />,
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => formatMoney(row.amount),
              },
              {
                key: 'action',
                label: '',
                render: (row) => (
                  <Link to={`/service-manager/jobs/${row.id}`}>
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
