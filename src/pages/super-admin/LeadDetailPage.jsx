import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pause,
  Play,
  Send,
  UserRound,
  Bot,
  ChevronDown,
  ChevronUp,
  StickyNote,
  Clock3,
  Activity,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useToast } from '../../hooks/useToast'
import leadService from '../../services/mock/leadService'
import conversationService from '../../services/mock/conversationService'
import LeadLifecycle from './leads/LeadLifecycle'
import AssignSalespersonModal from './leads/AssignSalespersonModal'
import ChangeStatusModal from './leads/ChangeStatusModal'
import AddNoteModal from './leads/AddNoteModal'
import EditLeadModal from './leads/EditLeadModal'

export default function LeadDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [lead, setLead] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseLoading, setPauseLoading] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const chatEndRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [leadData, conversation] = await Promise.all([
        leadService.getLeadById(id),
        conversationService.getConversation(id),
      ])
      setLead(leadData)
      setMessages(conversation)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  const refreshLead = async () => {
    const leadData = await leadService.getLeadById(id)
    setLead(leadData)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !lead || sending) return

    const text = draft.trim()
    setDraft('')
    setSending(true)

    try {
      const userMessage = await conversationService.sendMessage(
        lead.id,
        text,
        'customer',
      )
      setMessages((prev) => [...prev, userMessage])
      showToast('Message sent.')

      if (!lead.aiPaused) {
        setAiTyping(true)
        const reply = await conversationService.sendAiReply(lead.id, text)
        setMessages((prev) => [...prev, reply])
      }
    } finally {
      setAiTyping(false)
      setSending(false)
    }
  }

  const confirmPause = async () => {
    setPauseLoading(true)
    try {
      await conversationService.pauseAI()
      await leadService.setLeadAiPaused(lead.id, true)
      await refreshLead()
      showToast('AI paused.')
      setPauseOpen(false)
    } finally {
      setPauseLoading(false)
    }
  }

  const resumeAi = async () => {
    setPauseLoading(true)
    try {
      await conversationService.resumeAI()
      await leadService.setLeadAiPaused(lead.id, false)
      await refreshLead()
      showToast('AI resumed.')
    } finally {
      setPauseLoading(false)
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
      <div className="mx-auto max-w-3xl">
        <Card>
          <h1 className="text-xl font-semibold">Lead not found</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            The requested lead does not exist in mock data.
          </p>
          <Link to="/super-admin/leads" className="mt-4 inline-block">
            <Button variant="secondary">
              <ArrowLeft size={16} />
              Back to Leads
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const breakdown = lead.scoreBreakdown || {}

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back to Leads
          </Button>
        </Link>
      </div>

      <PageHeader
        title={lead.customerName}
        description={`${lead.id} · ${lead.dealership}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={lead.status} />
            <StatusBadge status={`Tier ${lead.tier}`} />
            <span className="inline-flex items-center rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-accent)]">
              Score {lead.score}
            </span>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setAssignOpen(true)}>
          Assign Salesperson
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStatusOpen(true)}>
          Change Status
        </Button>
        {lead.aiPaused ? (
          <Button size="sm" onClick={resumeAi} disabled={pauseLoading}>
            <Play size={14} />
            Resume AI
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setPauseOpen(true)}>
            <Pause size={14} />
            Pause AI
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setNoteOpen(true)}>
          Add Note
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
          Edit Lead
        </Button>
      </div>

      {lead.aiPaused && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--status-pending)] bg-[var(--status-pending-bg)] px-4 py-3 text-sm text-[var(--status-pending)]">
          <strong>AI PAUSED</strong> · Human Agent Active
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Conversation */}
        <Card className="flex min-h-[560px] flex-col xl:col-span-2" padding={false}>
          <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-base font-semibold">Conversation</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {lead.aiPaused ? 'AI PAUSED' : 'AI ACTIVE'}
              </p>
            </div>
            <StatusBadge status={lead.aiPaused ? 'Pending' : 'Ready'} />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {messages.map((message) => {
              const isCustomer = message.sender === 'customer'
              const isAi = message.sender === 'ai'
              return (
                <div
                  key={message.id}
                  className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[var(--radius-lg)] px-3.5 py-2.5 sm:max-w-[75%] ${
                      isCustomer
                        ? 'bg-[var(--bg-muted)] text-[var(--text-primary)]'
                        : 'bg-[var(--brand-primary)] text-white'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] opacity-80">
                      {isCustomer ? <UserRound size={12} /> : <Bot size={12} />}
                      <span className="font-medium">
                        {isCustomer ? 'Customer' : isAi ? 'AI' : 'Agent'}
                      </span>
                      <span>· {message.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              )
            })}

            {aiTyping && (
              <div className="flex justify-end">
                <div className="rounded-[var(--radius-lg)] bg-[var(--brand-primary)] px-3.5 py-2.5 text-sm text-white opacity-80">
                  AI is typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-[var(--border-default)] p-3 sm:p-4"
          >
            <input
              className="input-field"
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !draft.trim()}>
              {sending ? <LoadingSpinner size={16} /> : <Send size={16} />}
              Send
            </Button>
          </form>
        </Card>

        {/* Right panel */}
        <div className="space-y-4">
          <Card className="xl:hidden" padding={false}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setInfoOpen((v) => !v)}
            >
              <span className="text-sm font-semibold">Lead Information</span>
              {infoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {infoOpen && (
              <div className="border-t border-[var(--border-default)] px-4 py-3">
                <LeadInfoPanel lead={lead} />
              </div>
            )}
          </Card>

          <Card className="hidden xl:block">
            <h2 className="text-base font-semibold">Lead Information</h2>
            <div className="mt-3">
              <LeadInfoPanel lead={lead} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Customer Information</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <InfoRow label="Name" value={lead.customerName} />
              <InfoRow label="Phone" value={lead.phone} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Location" value={`${lead.city}, ${lead.state}`} />
              <InfoRow label="Language" value={lead.language} />
              <InfoRow label="Lead Source" value={lead.source} />
              <InfoRow label="Created Date" value={lead.createdLabel} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Qualification</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <InfoRow label="Budget" value={lead.budget} />
              <InfoRow label="Desired Vehicle" value={lead.vehicle} />
              <InfoRow label="Buying Timeline" value={lead.timeline} />
              <InfoRow label="Location / Neighborhood" value={lead.location} />
              <InfoRow label="Financing Preference" value={lead.financing} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Lead Score</h2>
            <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] px-4 py-4 text-center">
              <p className="text-3xl font-semibold text-[var(--brand-primary)]">
                {lead.score} / 100
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--brand-accent)]">
                Tier {lead.tier}
              </p>
              <div className="mt-2 flex justify-center">
                <StatusBadge status={lead.status} />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <ScoreRow label="Budget" value={breakdown.budget} />
              <ScoreRow label="Vehicle" value={breakdown.vehicle} />
              <ScoreRow label="Timeline" value={breakdown.timeline} />
              <ScoreRow label="Location" value={breakdown.location} />
              <ScoreRow label="Financing" value={breakdown.financing} />
              <div className="border-t border-[var(--border-default)] pt-2 font-semibold">
                Total: {lead.score} / 100
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Lead Lifecycle</h2>
            <div className="mt-4">
              <LeadLifecycle currentStatus={lead.status} />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Clock3 size={16} className="text-[var(--brand-accent)]" />
            <h2 className="text-base font-semibold">Lead Timeline</h2>
          </div>
          <ul className="space-y-3">
            {(lead.timelineEvents || []).map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand-accent)]" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-[var(--brand-accent)]" />
            <h2 className="text-base font-semibold">Lead Activity</h2>
          </div>
          <ul className="space-y-3">
            {(lead.activity || []).map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <p className="text-sm font-medium">{item.description}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {item.actor} · {item.time}
                </p>
              </li>
            ))}
          </ul>

          {(lead.notes || []).length > 0 && (
            <div className="mt-5 border-t border-[var(--border-default)] pt-4">
              <div className="mb-2 flex items-center gap-2">
                <StickyNote size={14} />
                <h3 className="text-sm font-semibold">Notes</h3>
              </div>
              <ul className="space-y-2">
                {lead.notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                  >
                    <p>{note.text}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {note.author} · {note.time}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <ConfirmModal
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        onConfirm={confirmPause}
        title="Pause AI conversation?"
        message="Pause AI conversation? Automatic AI replies will stop until resumed."
        confirmLabel="Pause AI"
        loading={pauseLoading}
        danger
      />

      <AssignSalespersonModal
        open={assignOpen}
        lead={lead}
        onClose={() => setAssignOpen(false)}
        onAssigned={async () => {
          showToast('Lead assigned successfully.')
          setAssignOpen(false)
          await refreshLead()
        }}
      />
      <ChangeStatusModal
        open={statusOpen}
        lead={lead}
        onClose={() => setStatusOpen(false)}
        onChanged={async () => {
          showToast('Lead status changed.')
          setStatusOpen(false)
          await refreshLead()
        }}
      />
      <AddNoteModal
        open={noteOpen}
        lead={lead}
        onClose={() => setNoteOpen(false)}
        onSaved={async () => {
          showToast('Note added.')
          setNoteOpen(false)
          await refreshLead()
        }}
      />
      <EditLeadModal
        open={editOpen}
        lead={lead}
        onClose={() => setEditOpen(false)}
        onSaved={async () => {
          showToast('Lead updated successfully.')
          setEditOpen(false)
          await refreshLead()
        }}
      />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--text-primary)]">
        {value || '—'}
      </dd>
    </div>
  )
}

function ScoreRow({ label, value = 0 }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium">
        {value} / 20
      </span>
    </div>
  )
}

function LeadInfoPanel({ lead }) {
  return (
    <dl className="space-y-2 text-sm">
      <InfoRow label="Customer" value={lead.customerName} />
      <InfoRow label="Vehicle" value={lead.vehicle} />
      <InfoRow label="Budget" value={lead.budget} />
      <InfoRow label="Timeline" value={lead.timeline} />
      <InfoRow label="Location" value={lead.location} />
      <InfoRow label="Financing" value={lead.financing} />
      <InfoRow label="Score" value={lead.score} />
      <InfoRow label="Tier" value={lead.tier} />
      <InfoRow label="Status" value={lead.status} />
      <InfoRow label="Dealership" value={lead.dealership} />
      <InfoRow label="Salesperson" value={lead.salesperson} />
    </dl>
  )
}
