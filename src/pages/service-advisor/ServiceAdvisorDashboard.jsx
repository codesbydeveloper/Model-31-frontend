import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Wrench, Clock, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getServiceAdvisorDashboard } from '../../services/api/serviceAdvisorService'

export default function ServiceAdvisorDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getServiceAdvisorDashboard())
    } catch (err) {
      setData({
        greeting: '',
        subtitle: '',
        todaysAppointments: 0,
        checkedIn: 0,
        inWork: 0,
        readyForPickup: 0,
        myJobsToday: [],
      })
      showToast(err.message || 'Unable to load service advisor dashboard.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

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

  const firstName = (user?.name || 'Advisor').split(' ')[0]
  const title = data.greeting || `Good day, ${firstName}`
  const description =
    data.subtitle || `${user?.dealership || 'Service'} · Service Advisor desk`

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader title={title} description={description} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today’s Appointments" value={data.todaysAppointments} icon={CalendarCheck} />
        <StatCard label="Checked In" value={data.checkedIn} icon={Clock} />
        <StatCard label="In Work" value={data.inWork} icon={Wrench} />
        <StatCard label="Ready for Pickup" value={data.readyForPickup} icon={CheckCircle2} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">My jobs today</h2>
          <Link to="/service-advisor/jobs">
            <Button size="sm" variant="secondary">
              View all
            </Button>
          </Link>
        </div>
        {data.myJobsToday.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No jobs today.</p>
        ) : (
          <ul className="space-y-2">
            {data.myJobsToday.map((job) => (
              <li key={job.id}>
                <Link
                  to={`/service-advisor/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2.5 hover:bg-[var(--bg-muted)]"
                >
                  <div>
                    <p className="text-sm font-medium">{job.customerName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {job.vehicle} · {job.concern}
                    </p>
                  </div>
                  <StatusBadge status={job.statusLabel} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
