import { useCallback, useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import leadService from '../../services/mock/leadService'
import conversationService from '../../services/mock/conversationService'

export default function DealershipConversationsPage() {
  const [leads, setLeads] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await leadService.getLeads()
      setLeads(rows)
      setSelectedId(rows[0]?.id || '')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  useEffect(() => {
    if (!selectedId) return undefined
    const t = window.setTimeout(async () => {
      const thread = await conversationService.getConversation(selectedId)
      setMessages(thread)
    }, 0)
    return () => window.clearTimeout(t)
  }, [selectedId])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading conversations…" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Dealership', to: '/dealership/dashboard' },
          { label: 'Conversations' },
        ]}
      />
      <PageHeader
        title="Conversations"
        description="Monitor AI and agent conversations for dealership leads."
      />
      {leads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Lead conversations will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="max-h-[70vh] overflow-y-auto p-0">
            <ul>
              {leads.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(l.id)}
                    className={`w-full border-b border-[var(--border-default)] px-3 py-3 text-left hover:bg-[var(--bg-muted)] ${
                      selectedId === l.id ? 'bg-[var(--brand-accent-soft)]' : ''
                    }`}
                  >
                    <p className="text-sm font-medium">{l.customerName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{l.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex max-h-[70vh] flex-col p-4">
            <div className="mb-3 border-b border-[var(--border-default)] pb-2">
              <p className="font-semibold">
                {leads.find((l) => l.id === selectedId)?.customerName || 'Thread'}
              </p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No messages for this lead yet.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-[var(--radius-md)] px-3 py-2 text-sm ${
                      m.sender === 'customer'
                        ? 'ml-8 bg-[var(--bg-muted)]'
                        : 'mr-8 bg-[var(--brand-accent-soft)]'
                    }`}
                  >
                    <p className="text-[11px] font-medium uppercase text-[var(--text-muted)]">
                      {m.sender}
                    </p>
                    <p>{m.text}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
