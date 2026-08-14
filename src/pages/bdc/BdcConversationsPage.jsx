import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot, UserRound, Send } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import conversationService from '../../services/mock/conversationService'
import bdcService from '../../services/mock/bdcService'

export default function BdcConversationsPage() {
  const [params] = useSearchParams()
  const [leads, setLeads] = useState([])
  const [selectedId, setSelectedId] = useState(params.get('lead') || '')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await bdcService.getBdcLeads()
      setLeads(rows)
      const first = params.get('lead') || rows[0]?.id
      setSelectedId(first)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  useEffect(() => {
    if (!selectedId) return undefined
    let active = true
    const t = window.setTimeout(async () => {
      const msgs = await conversationService.getConversation(selectedId)
      if (active) setMessages(msgs)
    }, 0)
    return () => {
      active = false
      window.clearTimeout(t)
    }
  }, [selectedId])

  const selected = useMemo(
    () => leads.find((item) => item.id === selectedId) || null,
    [leads, selectedId],
  )

  const send = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !selectedId) return
    setSending(true)
    try {
      const msg = await conversationService.sendMessage(
        selectedId,
        draft.trim(),
        'agent',
      )
      setMessages((prev) => [...prev, msg])
      setDraft('')
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
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Conversations"
        description="Monitor customer and AI conversations across the BDC queue."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-3" padding={false}>
          <div className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-semibold">
            Conversation list
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedId(lead.id)}
                className={`block w-full border-b border-[var(--border-default)] px-4 py-3 text-left hover:bg-[var(--bg-muted)] ${
                  selectedId === lead.id ? 'bg-[var(--brand-accent-soft)]' : ''
                }`}
              >
                <p className="text-sm font-semibold">{lead.customerName}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {lead.id} · {lead.vehicle}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[560px] flex-col xl:col-span-6" padding={false}>
          <div className="border-b border-[var(--border-default)] px-4 py-3">
            <h2 className="text-base font-semibold">
              {selected?.customerName || 'Select a conversation'}
            </h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => {
              const isCustomer = message.sender === 'customer'
              return (
                <div
                  key={message.id}
                  className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[var(--radius-lg)] px-3 py-2.5 ${
                      isCustomer
                        ? 'bg-[var(--bg-muted)]'
                        : 'bg-[var(--brand-primary)] text-white'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] opacity-80">
                      {isCustomer ? <UserRound size={12} /> : <Bot size={12} />}
                      <span>
                        {isCustomer
                          ? 'Customer'
                          : message.sender === 'ai'
                            ? 'AI'
                            : 'Agent'}
                      </span>
                      <span>· {message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-[var(--border-default)] p-3">
            <input
              className="input-field"
              placeholder="Type a monitoring note/message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" disabled={sending || !draft.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </Card>

        <Card className="xl:col-span-3">
          <h2 className="text-base font-semibold">Lead details</h2>
          {selected ? (
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Customer" value={selected.customerName} />
              <Row label="Vehicle" value={selected.vehicle} />
              <Row label="Score" value={selected.score} />
              <Row label="Tier" value={selected.tier} />
              <Row
                label="Status"
                value={<StatusBadge status={selected.bdcStatus || selected.status} />}
              />
              <Row label="Salesperson" value={selected.salesperson || 'Unassigned'} />
              <Row label="Conversation" value="Active" />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Select a conversation to view lead details.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
