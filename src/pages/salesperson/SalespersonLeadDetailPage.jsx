import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Phone } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import salespersonService from '../../services/mock/salespersonService'
import appointmentService from '../../services/mock/appointmentService'
import { SP_LEAD_STATUSES } from '../../data/salespersonLeads'
import CreateAppointmentModal from './appointments/CreateAppointmentModal'
import MarkSoldModal from './leads/MarkSoldModal'

function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function SalespersonLeadDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [lead, setLead] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [status, setStatus] = useState('NEW')
  const [statusSaving, setStatusSaving] = useState(false)
  const [apptOpen, setApptOpen] = useState(false)
  const [soldOpen, setSoldOpen] = useState(false)
  const [notSoldOpen, setNotSoldOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await salespersonService.getMyLeadById(id)
      setLead(data)
      if (data) setStatus(data.status)
      const all = await appointmentService.getAppointments('sp_001')
      const related = all
        .filter(
          (a) =>
            a.leadId === id &&
            a.status !== 'CANCELLED' &&
            a.status !== 'COMPLETED' &&
            a.status !== 'NO SHOW',
        )
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
      setAppointment(related || null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const saveNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setNoteSaving(true)
    try {
      const updated = await salespersonService.addMyLeadNote(id, note.trim())
      setLead(updated)
      setNote('')
      setNoteOpen(false)
      showToast('Note added.')
    } finally {
      setNoteSaving(false)
    }
  }

  const saveStatus = async () => {
    setStatusSaving(true)
    try {
      const updated = await salespersonService.updateMyLeadStatus(id, status)
      setLead(updated)
      setStatusOpen(false)
      showToast('Status updated.')
    } finally {
      setStatusSaving(false)
    }
  }

  const markNotSold = async () => {
    setActionBusy(true)
    try {
      const updated = await salespersonService.updateMyLeadStatus(id, 'NOT SOLD')
      setLead(updated)
      setNotSoldOpen(false)
      showToast('Lead marked as not sold.')
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-lg pb-20">
        <Card>
          <h1 className="text-xl font-semibold">Lead not found</h1>
          <Link to="/salesperson/leads" className="mt-4 inline-block">
            <Button variant="secondary">Back to My Leads</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 md:pb-0">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/salesperson/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>

      <PageHeader
        title={lead.customerName}
        description={`${lead.id} · ${lead.dealership}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.status} />
            <StatusBadge status={`Tier ${lead.tier}`} />
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Lead Score</p>
            <p className="text-3xl font-semibold text-[var(--brand-accent)]">
              {lead.score}
            </p>
          </div>
          <a href={`tel:${lead.phone}`}>
            <Button className="min-h-12">
              <Phone size={16} />
              Contact Customer
            </Button>
          </a>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="text-base font-semibold">Upcoming Appointment</h2>
        {appointment ? (
          <div className="mt-3">
            <p className="font-medium">{appointment.customerName}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {appointment.vehicle}
            </p>
            <p className="mt-1 text-sm">
              {appointment.date} · {formatTime(appointment.time)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={appointment.status} />
              <Link to={`/salesperson/appointments/${appointment.id}`}>
                <Button size="sm">View Appointment</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-[var(--text-secondary)]">
              No appointment scheduled.
            </p>
            <Button className="mt-3" size="sm" onClick={() => setApptOpen(true)}>
              Schedule Appointment
            </Button>
          </div>
        )}
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" className="min-h-11" onClick={() => setNoteOpen(true)}>
          Add Note
        </Button>
        <Button variant="secondary" className="min-h-11" onClick={() => setApptOpen(true)}>
          Schedule Appointment
        </Button>
        <Button variant="secondary" className="min-h-11" onClick={() => setStatusOpen(true)}>
          Change Status
        </Button>
        <Link to="/salesperson/conversations">
          <Button variant="secondary" className="min-h-11 w-full">
            Conversation
          </Button>
        </Link>
        <Button className="min-h-11" onClick={() => setSoldOpen(true)}>
          MARK SOLD
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => setNotSoldOpen(true)}
        >
          MARK NOT SOLD
        </Button>
      </div>

      <Card className="mb-4">
        <h2 className="text-base font-semibold">Customer Information</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Info label="Phone" value={lead.phone} />
          <Info label="Email" value={lead.email} />
          <Info label="Vehicle" value={lead.vehicle} />
          <Info label="Budget" value={lead.budget} />
          <Info label="Timeline" value={lead.timeline} />
          <Info label="Location" value={lead.location} />
          <Info label="Financing" value={lead.financing} />
        </dl>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Activity / Timeline</h2>
        <ul className="mt-3 space-y-2">
          {(lead.activity || []).map((item) => (
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
        {(lead.notes || []).length > 0 && (
          <div className="mt-4 border-t border-[var(--border-default)] pt-3">
            <h3 className="mb-2 text-sm font-semibold">Notes</h3>
            {lead.notes.map((n) => (
              <div
                key={n.id}
                className="mb-2 rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              >
                <p>{n.text}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {n.author} · {n.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Add Note">
        <form onSubmit={saveNote}>
          <textarea
            className="input-field min-h-28"
            placeholder="Internal note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={noteSaving}>
              {noteSaving ? <LoadingSpinner size={16} /> : 'Save Note'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Change Status">
        <Select
          label="Lead Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={SP_LEAD_STATUSES}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setStatusOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveStatus} disabled={statusSaving}>
            {statusSaving ? <LoadingSpinner size={16} /> : 'Update Status'}
          </Button>
        </div>
      </Modal>

      <CreateAppointmentModal
        open={apptOpen}
        defaults={{
          leadId: lead.id,
          customerName: lead.customerName,
          vehicle: lead.vehicle,
          dealership: lead.dealership,
          phone: lead.phone,
          email: lead.email,
        }}
        onClose={() => setApptOpen(false)}
        onCreated={async () => {
          showToast('Appointment scheduled successfully.')
          setApptOpen(false)
          const updated = await salespersonService.updateMyLeadStatus(id, 'APPOINTMENT')
          setLead(updated)
          await load()
        }}
      />

      <MarkSoldModal
        open={soldOpen}
        lead={lead}
        onClose={() => setSoldOpen(false)}
        onSold={async () => {
          showToast('Deal marked as sold.')
          showToast('Commission calculated successfully.')
          setSoldOpen(false)
          await load()
        }}
      />

      <ConfirmModal
        open={notSoldOpen}
        onClose={() => setNotSoldOpen(false)}
        onConfirm={markNotSold}
        title="Mark not sold?"
        message="Mark this lead as not sold?"
        confirmLabel="Mark Not Sold"
        danger
        loading={actionBusy}
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
