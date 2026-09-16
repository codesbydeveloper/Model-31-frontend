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
import leadService from '../../services/api/leadService'
import { getNuclearMode } from '../../services/api/superAdminDashboardService'
import LeadLifecycle from './leads/LeadLifecycle'
import AssignSalespersonModal from './leads/AssignSalespersonModal'
import ChangeStatusModal from './leads/ChangeStatusModal'
import AddNoteModal from './leads/AddNoteModal'
import EditLeadModal from './leads/EditLeadModal'
import AcquisitionSignalsCard from '../../components/acquisition/AcquisitionSignalsCard'
import LeadClassificationCard from '../../components/leads/LeadClassificationCard'
import PipelineBadge from '../../components/common/PipelineBadge'
import BuyerGenomeCard from '../../components/leads/BuyerGenomeCard'
import BehavioralSignalsCard from '../../components/leads/BehavioralSignalsCard'
import GenomeTimeline from '../../components/leads/GenomeTimeline'
import AdaptiveConversationPanel from '../../components/leads/AdaptiveConversationPanel'
import BuyOnlineCard from '../../components/leads/BuyOnlineCard'
import VehicleVisualPackageCard from '../../components/leads/VehicleVisualPackageCard'
import DealStatusStrip from '../../components/leads/DealStatusStrip'
import StaffDealerFlow from '../../components/leads/StaffDealerFlow'

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
  const [genome, setGenome] = useState(null)
  const [signals, setSignals] = useState([])
  const [nuclear, setNuclear] = useState(null)
  const [handoff, setHandoff] = useState(null)
  const [visualPack, setVisualPack] = useState(null)
  const [negotiation, setNegotiation] = useState(null)
  const [strategyDismissed, setStrategyDismissed] = useState(false)
  const chatEndRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const leadData = await leadService.getLeadById(id)
      if (!leadData) {
        setLead(null)
        return
      }

      const [conversation, genomeData, signalData, nuclearData, handoffData, packData, limits, noteRows] =
        await Promise.all([
          leadService.getLeadConversation(id).catch(() => []),
          leadService.getLeadGenome(id).catch(() => null),
          leadService.getLeadBehaviorSignals(id).catch(() => []),
          getNuclearMode().catch(() => null),
          leadService.getLeadHandoff(id).catch(() => null),
          leadService.getLeadVisualPackage(id).catch(() => null),
          leadService.getNegotiationLimitsForLead().catch(() => []),
          leadService.getLeadNotes(id).catch(() => []),
        ])
      setLead({
        ...leadData,
        notes: Array.isArray(noteRows) && noteRows.length ? noteRows : leadData.notes,
      })
      setMessages(Array.isArray(conversation) ? conversation : [])
      setGenome(genomeData)
      setSignals(Array.isArray(signalData) ? signalData : [])
      setNuclear(nuclearData)
      setHandoff(handoffData)
      setVisualPack(packData)
      setNegotiation(
        (Array.isArray(limits) ? limits : []).find((row) => {
          if (row?.vin && row.vin === handoffData?.vin) return true
          const token = leadData.vehicle?.split(' ').filter(Boolean).slice(-1)[0]
          return Boolean(
            token && typeof row?.vehicle === 'string' && row.vehicle.includes(token),
          )
        }) || null,
      )
    } catch (err) {
      setLead(null)
      showToast(err.message || 'Unable to load lead.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

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
    const [leadData, noteRows] = await Promise.all([
      leadService.getLeadById(id),
      leadService.getLeadNotes(id).catch(() => []),
    ])
    setLead({
      ...leadData,
      notes: Array.isArray(noteRows) && noteRows.length ? noteRows : leadData?.notes,
    })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !lead || sending) return

    const text = draft.trim()
    setDraft('')
    setSending(true)

    try {
      const sent = await leadService.sendLeadConversationMessage(lead.id, text)
      if (sent.userMessage && sent.userMessage !== true) {
        setMessages((prev) => [...prev, sent.userMessage])
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `local_${Date.now()}`, sender: 'customer', text, timestamp: '' },
        ])
      }
      showToast('Message sent.')

      if (sent.reply) {
        setMessages((prev) => [...prev, sent.reply])
      } else if (Array.isArray(sent.extra) && sent.extra.length) {
        setMessages((prev) => [...prev, ...sent.extra])
      } else if (!lead.aiPaused) {
        const refreshed = await leadService.getLeadConversation(lead.id).catch(() => [])
        if (refreshed.length) setMessages(refreshed)
      }
    } catch (err) {
      showToast(err.message || 'Unable to send message.', 'error')
    } finally {
      setAiTyping(false)
      setSending(false)
    }
  }

  const confirmPause = async () => {
    setPauseLoading(true)
    try {
      await leadService.setLeadAiPaused(lead.id, true)
      await refreshLead()
      showToast('AI paused.')
      setPauseOpen(false)
    } catch (err) {
      showToast(err.message || 'Unable to pause AI.', 'error')
    } finally {
      setPauseLoading(false)
    }
  }

  const resumeAi = async () => {
    setPauseLoading(true)
    try {
      await leadService.setLeadAiPaused(lead.id, false)
      await refreshLead()
      showToast('AI resumed.')
    } catch (err) {
      showToast(err.message || 'Unable to resume AI.', 'error')
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
            The requested lead could not be loaded.
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
  const timelineEvents = Array.isArray(lead.timelineEvents) ? lead.timelineEvents : []
  const activityItems = Array.isArray(lead.activity) ? lead.activity : []
  const notes = Array.isArray(lead.notes) ? lead.notes : []
  const chatMessages = Array.isArray(messages) ? messages : []

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
            <PipelineBadge pipelineType={lead.pipelineType} />
            <StatusBadge status={lead.status} />
            <StatusBadge status={`Tier ${lead.tier}`} />
            <span className="inline-flex items-center rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-accent)]">
              Score {lead.score}
            </span>
          </div>
        }
      />

      <div className="mb-5">
        <LeadClassificationCard lead={lead} />
      </div>

      <div className="mb-5">
        <DealStatusStrip
          nuclearOn={Boolean(nuclear?.enabled)}
          negotiationStatus={negotiation?.status || (handoff ? 'CONFIGURED' : 'UNAVAILABLE')}
          handoff={handoff}
        />
      </div>

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
            {chatMessages.map((message) => {
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

          {genome && !strategyDismissed && (
            <div className="border-t border-[var(--border-default)] p-3 sm:p-4">
              <AdaptiveConversationPanel
                genome={genome}
                dismissed={strategyDismissed}
                onUse={(text) => {
                  setDraft(text)
                  showToast('Suggestion added to the composer. Message was not sent.')
                }}
                onEdit={(text) => {
                  setDraft(text)
                  showToast('Suggestion loaded for editing. Message was not sent.')
                }}
                onDismiss={() => setStrategyDismissed(true)}
              />
            </div>
          )}

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

          <AcquisitionSignalsCard signals={lead.acquisitionSignals} />

          <BuyerGenomeCard genome={genome} />
          <BehavioralSignalsCard signals={signals} />
          <GenomeTimeline events={Array.isArray(genome?.timeline) ? genome.timeline : []} />
          <BuyOnlineCard
            nuclearOn={Boolean(nuclear?.enabled)}
            intent={genome?.intent}
            dealStatus={handoff?.dealStatus}
            vehicle={handoff?.vehicle || lead.vehicle}
          />
          {visualPack ? (
            <VehicleVisualPackageCard pack={visualPack} />
          ) : null}
          {lead.source === 'Authorized Staff Social Account' && (
            <StaffDealerFlow showTransfer={handoff?.dealStatus === 'DEAL READY'} />
          )}

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
            {timelineEvents.map((item) => (
              <li key={item.id || item.label} className="flex gap-3">
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
            {activityItems.map((item) => (
              <li
                key={item.id || item.description}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <p className="text-sm font-medium">{item.description}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {item.actor} · {item.time}
                </p>
              </li>
            ))}
          </ul>

          {notes.length > 0 && (
            <div className="mt-5 border-t border-[var(--border-default)] pt-4">
              <div className="mb-2 flex items-center gap-2">
                <StickyNote size={14} />
                <h3 className="text-sm font-semibold">Notes</h3>
              </div>
              <ul className="space-y-2">
                {notes.map((note) => (
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
