import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot, UserRound, Send } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useToast } from '../../hooks/useToast'
import salespersonConversationService from '../../services/api/salespersonConversationService'

export default function SalespersonConversationsPage() {
  const { showToast } = useToast()
  const [params] = useSearchParams()
  const [leads, setLeads] = useState([])
  const [selectedId, setSelectedId] = useState(params.get('lead') || '')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await salespersonConversationService.getSalespersonConversations()
      setLeads(rows)
      setSelectedId((current) => current || params.get('lead') || rows[0]?.id || '')
    } catch (err) {
      setLeads([])
      showToast(err.message || 'Unable to load conversations.', 'error')
    } finally {
      setLoading(false)
    }
  }, [params, showToast])

  const loadThread = useCallback(
    async (leadId) => {
      if (!leadId) {
        setMessages([])
        return
      }
      try {
        setMessages(await salespersonConversationService.getSalespersonConversation(leadId))
      } catch (err) {
        setMessages([])
        showToast(err.message || 'Unable to load messages.', 'error')
      }
    },
    [showToast],
  )

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  useEffect(() => {
    if (!selectedId) return undefined
    const t = window.setTimeout(() => void loadThread(selectedId), 0)
    return () => window.clearTimeout(t)
  }, [selectedId, loadThread])

  const selected = useMemo(
    () => leads.find((item) => item.id === selectedId) || null,
    [leads, selectedId],
  )

  const send = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !selectedId) return
    setSending(true)
    try {
      await salespersonConversationService.sendSalespersonMessage(selectedId, draft.trim())
      setDraft('')
      showToast('Message sent.')
      await loadThread(selectedId)
    } catch (err) {
      showToast(err.message || 'Unable to send message.', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Conversations"
        description="Continue customer conversations from your assigned leads."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1" padding={false}>
          <div className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-semibold">
            My conversations
          </div>
          <div className="max-h-[50vh] overflow-y-auto lg:max-h-[70vh]">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedId(lead.id)}
                className={`block w-full border-b border-[var(--border-default)] px-4 py-3 text-left ${
                  selectedId === lead.id ? 'bg-[var(--brand-accent-soft)]' : ''
                }`}
              >
                <p className="font-semibold">{lead.customerName}</p>
                <p className="text-xs text-[var(--text-secondary)]">{lead.vehicle}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[520px] flex-col lg:col-span-2" padding={false}>
          <div className="border-b border-[var(--border-default)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">
                  {selected?.customerName || 'Select a lead'}
                </h2>
                {selected && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    {selected.vehicle} · {selected.budget} · {selected.timeline}
                  </p>
                )}
              </div>
              {selected && <StatusBadge status={selected.status} />}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => {
              const sender = String(message.sender || '').toLowerCase()
              const mine = sender !== 'customer' && sender !== 'lead'
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[var(--radius-lg)] px-3 py-2.5 ${
                      mine
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'bg-[var(--bg-muted)]'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] opacity-80">
                      {mine ? <Bot size={12} /> : <UserRound size={12} />}
                      <span>
                        {sender === 'customer' || sender === 'lead'
                          ? 'Customer'
                          : sender === 'ai'
                            ? 'AI'
                            : 'Salesperson'}
                      </span>
                      <span>· {message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <form
            onSubmit={send}
            className="flex gap-2 border-t border-[var(--border-default)] p-3"
          >
            <input
              className="input-field"
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" disabled={sending || !draft.trim()}>
              {sending ? <LoadingSpinner size={16} /> : <Send size={16} />}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
