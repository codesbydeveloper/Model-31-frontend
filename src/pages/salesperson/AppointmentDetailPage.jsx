import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Toggle from '../../components/common/Toggle'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import appointmentService from '../../services/mock/appointmentService'

function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function AppointmentDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [apt, setApt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [reschedule, setReschedule] = useState({ date: '', time: '', notes: '' })
  const [noShowOpen, setNoShowOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setApt(await appointmentService.getAppointmentById(id))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const run = async (fn, message) => {
    setBusy(true)
    try {
      const updated = await fn()
      setApt(updated)
      showToast(message)
    } finally {
      setBusy(false)
    }
  }

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

      <div className="mb-4 flex flex-wrap gap-2">
        {apt.status === 'SCHEDULED' && (
          <Button
            size="sm"
            disabled={busy}
            onClick={() =>
              run(
                () => appointmentService.confirmAppointment(apt.id),
                'Appointment confirmed.',
              )
            }
          >
            Confirm
          </Button>
        )}
        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setReschedule({ date: apt.date, time: apt.time, notes: apt.notes })
              setRescheduleOpen(true)
            }}
          >
            Reschedule
          </Button>
        )}
        {(apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED') && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              run(
                () => appointmentService.completeAppointment(apt.id),
                'Appointment completed.',
              )
            }
          >
            Complete
          </Button>
        )}
        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.status !== 'NO SHOW' && (
          <>
            <Button size="sm" variant="secondary" onClick={() => setNoShowOpen(true)}>
              Mark No Show
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCancelOpen(true)}>
              Cancel Appointment
            </Button>
          </>
        )}
      </div>

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
            {apt.cancellationReason && (
              <Info label="Cancellation Reason" value={apt.cancellationReason} />
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Reminder</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Frontend-only reminder toggles. No SMS or email is sent.
          </p>
          <div className="mt-4 space-y-4">
            <Toggle
              label="Customer reminder"
              description="24 hours before"
              checked={apt.customerReminder}
              onChange={async (next) => {
                const updated = await appointmentService.updateReminders(apt.id, {
                  customerReminder: next,
                })
                setApt(updated)
                showToast(next ? 'Customer reminder on.' : 'Customer reminder off.')
              }}
            />
            <Toggle
              label="Salesperson reminder"
              description="1 hour before"
              checked={apt.salespersonReminder}
              onChange={async (next) => {
                const updated = await appointmentService.updateReminders(apt.id, {
                  salespersonReminder: next,
                })
                setApt(updated)
                showToast(
                  next ? 'Salesperson reminder on.' : 'Salesperson reminder off.',
                )
              }}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-base font-semibold">Activity</h2>
        <ul className="mt-3 space-y-2">
          {(apt.activity || []).length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">No activity yet.</p>
          )}
          {(apt.activity || []).map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
            >
              <p className="font-medium">{item.description}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {item.actor} · {item.time}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule Appointment"
      >
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            try {
              const updated = await appointmentService.rescheduleAppointment(apt.id, reschedule)
              setApt(updated)
              setRescheduleOpen(false)
              showToast('Appointment rescheduled successfully.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <Input
            label="Date"
            type="date"
            value={reschedule.date}
            onChange={(e) => setReschedule({ ...reschedule, date: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={reschedule.time}
            onChange={(e) => setReschedule({ ...reschedule, time: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Notes</label>
            <textarea
              className="input-field min-h-20"
              value={reschedule.notes}
              onChange={(e) => setReschedule({ ...reschedule, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <LoadingSpinner size={16} /> : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        onConfirm={async () => {
          await run(
            () => appointmentService.markNoShow(apt.id),
            'Appointment marked as no show.',
          )
          setNoShowOpen(false)
        }}
        title="Mark no show?"
        message="Are you sure you want to mark this appointment as a no show?"
        confirmLabel="Mark No Show"
        danger
        loading={busy}
      />

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Appointment">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!cancelReason.trim()) return
            setBusy(true)
            try {
              const updated = await appointmentService.cancelAppointment(
                apt.id,
                cancelReason.trim(),
              )
              setApt(updated)
              setCancelOpen(false)
              setCancelReason('')
              showToast('Appointment cancelled.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="mb-1.5 block text-sm font-medium">Cancellation reason</label>
          <textarea
            className="input-field min-h-24"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            placeholder="Enter a reason..."
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep Appointment
            </Button>
            <Button type="submit" disabled={busy || !cancelReason.trim()}>
              {busy ? <LoadingSpinner size={16} /> : 'Cancel Appointment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
