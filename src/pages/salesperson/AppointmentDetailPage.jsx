import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { getSalespersonAppointment } from '../../services/api/salespersonAppointmentService'

function formatTime(time) {
  if (!time) return '—'
  if (/am|pm/i.test(String(time))) return String(time)
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h)) return String(time)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${period}`
}

export default function AppointmentDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [apt, setApt] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setApt(await getSalespersonAppointment(id))
    } catch (err) {
      setApt(null)
      showToast(err.message || 'Unable to load appointment.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!apt) {
    return (
      <div className="mx-auto max-w-lg pb-20">
        <Card>
          <h1 className="text-xl font-semibold">Appointment not found</h1>
          <Link to="/salesperson/appointments" className="mt-4 inline-block">
            <Button variant="secondary">Back to Appointments</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-20 md:pb-0">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/salesperson/appointments">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>

      <PageHeader
        title={apt.customerName}
        description={`${apt.type} · ${apt.date} ${formatTime(apt.time)}`}
        actions={<StatusBadge status={apt.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold">Appointment Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Info label="Customer" value={apt.customerName} />
            <Info label="Phone" value={apt.phone} />
            <Info label="Email" value={apt.email} />
            <Info label="Vehicle" value={apt.vehicle} />
            <Info label="Appointment Type" value={apt.type} />
            <Info label="Date" value={apt.date} />
            <Info label="Time" value={formatTime(apt.time)} />
            <Info label="Dealership" value={apt.dealership} />
            <Info label="Salesperson" value={apt.salesperson} />
            <Info label="Lead ID" value={apt.leadId || '—'} />
            <Info label="Notes" value={apt.notes || '—'} />
          </dl>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Activity</h2>
          <ul className="mt-3 space-y-2">
            {(apt.activity || []).length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">No activity yet.</p>
            )}
            {(apt.activity || []).map((item) => (
              <li
                key={item.id || item.time}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
              >
                <p className="font-medium">{item.description || item.message}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {item.actor} · {item.time}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}
