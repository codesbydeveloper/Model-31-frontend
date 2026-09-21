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
import { getServiceAdvisorAppointments } from '../../services/api/serviceAdvisorService'

export default function ServiceAdvisorAppointmentsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getServiceAdvisorAppointments())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load appointments.', 'error')
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
        title="Service Appointments"
        description="Customers booked for service today."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No appointments today."
            columns={[
              { key: 'appointmentAt', label: 'Time' },
              { key: 'customerName', label: 'Customer' },
              { key: 'phone', label: 'Phone' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'concern', label: 'Concern' },
              {
                key: 'statusLabel',
                label: 'Status',
                render: (row) => <StatusBadge status={row.statusLabel} />,
              },
              {
                key: 'action',
                label: '',
                render: (row) => (
                  <Link to={`/service-advisor/jobs/${row.id}`}>
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
