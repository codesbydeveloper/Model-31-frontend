import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { getServiceManagerAdvisors } from '../../services/api/serviceManagerService'

export default function ServiceManagerAdvisorsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getServiceManagerAdvisors())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load advisors.', 'error')
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
        title="Service Advisors"
        description="Advisor load, completions, and CSI."
      />
      <Card>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable
            rows={rows}
            emptyTitle="No advisors."
            columns={[
              { key: 'name', label: 'Advisor' },
              { key: 'openJobs', label: 'Open jobs' },
              { key: 'completedToday', label: 'Completed today' },
              { key: 'delayed', label: 'Delayed' },
              { key: 'csi', label: 'CSI' },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
