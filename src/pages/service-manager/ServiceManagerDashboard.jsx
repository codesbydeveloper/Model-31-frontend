import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, AlertTriangle, Users, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getServiceManagerDashboard } from '../../services/api/serviceManagerService'

export default function ServiceManagerDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getServiceManagerDashboard())
    } catch (err) {
      setData({
        dealership: user?.dealership || '',
        openJobs: 0,
        delayedJobs: 0,
        completedJobs: 0,
        hoursBilled: 0,
        delayed: [],
        advisors: [],
      })
      showToast(err.message || 'Unable to load service manager dashboard.', 'error')
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
        title="Service Manager"
        description={`${data.dealership || user?.dealership || 'Shop'} · Open jobs, delays, and advisor load`}
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Jobs" value={data.openJobs} icon={ClipboardList} />
        <StatCard label="Delayed / Parts" value={data.delayedJobs} icon={AlertTriangle} />
        <StatCard label="Completed" value={data.completedJobs} icon={CheckCircle2} />
        <StatCard label="Hours Billed" value={data.hoursBilled} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Delayed jobs</h2>
            <Link to="/service-manager/delayed">
              <Button size="sm" variant="secondary">
                View all
              </Button>
            </Link>
          </div>
          {data.delayed.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No delayed jobs.</p>
          ) : (
            <ul className="space-y-2">
              {data.delayed.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{job.customerName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{job.delayReason}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Advisors</h2>
            <Link to="/service-manager/advisors">
              <Button size="sm" variant="secondary">
                View all
              </Button>
            </Link>
          </div>
          {data.advisors.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No advisors.</p>
          ) : (
            <ul className="space-y-2">
              {data.advisors.map((advisor) => (
                <li
                  key={advisor.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{advisor.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {advisor.openJobs} open · CSI {advisor.csi}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{advisor.completedToday} done</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
