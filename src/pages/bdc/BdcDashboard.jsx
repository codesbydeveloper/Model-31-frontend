import { useCallback, useEffect, useState } from 'react'
import {
  Target,
  Clock3,
  UserCheck,
  Handshake,
  AlertTriangle,
  Timer,
  Inbox,
  CalendarCheck,
  CheckCircle2,
  UserX,
  Percent,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import { formatNumber } from '../../utils/table'
import bdcService from '../../services/mock/bdcService'
import appointmentService from '../../services/mock/appointmentService'

const STATS = [
  { key: 'qualifiedToday', label: 'Qualified Today', icon: Target },
  { key: 'waitingForAssignment', label: 'Waiting for Assignment', icon: Inbox },
  { key: 'assigned', label: 'Assigned', icon: UserCheck },
  { key: 'accepted', label: 'Accepted', icon: Handshake },
  { key: 'expired', label: 'Expired', icon: Clock3 },
  { key: 'escalated', label: 'Escalated', icon: AlertTriangle },
  { key: 'averageResponseTime', label: 'Average Response Time', icon: Timer },
]

export default function BdcDashboard() {
  const [stats, setStats] = useState(null)
  const [apptStats, setApptStats] = useState(null)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, a] = await Promise.all([
        bdcService.getBDCStats(),
        bdcService.getSalespeopleAvailability(),
        appointmentService.getBdcAppointmentStats(),
      ])
      setStats(s)
      setPeople(p)
      setApptStats(a)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !stats || !apptStats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="BDC Manager Dashboard"
        description="Monitor qualified leads, dispatch activity and salesperson availability."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today's Appointments"
          value={formatNumber(apptStats.todaysAppointments)}
          icon={CalendarCheck}
        />
        <StatCard
          label="Completed Appointments"
          value={formatNumber(apptStats.completedAppointments)}
          icon={CheckCircle2}
        />
        <StatCard
          label="No Shows"
          value={formatNumber(apptStats.noShows)}
          icon={UserX}
        />
        <StatCard
          label="Appointment Conversion"
          value={`${apptStats.appointmentConversion}%`}
          icon={Percent}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {STATS.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            icon={icon}
            value={
              key === 'averageResponseTime'
                ? stats[key]
                : formatNumber(stats[key])
            }
          />
        ))}
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-base font-semibold">Salesperson Availability</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'dealership', label: 'Dealership' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            { key: 'currentLeads', label: 'Active Leads' },
            { key: 'lastActive', label: 'Last Active' },
            {
              key: 'capacity',
              label: 'Current Capacity',
              render: (row) => `${row.currentLeads}/${row.capacity}`,
            },
          ]}
          rows={people}
          pageSize={8}
        />
      </Card>
    </div>
  )
}
