import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import dealershipConversationService from '../../services/api/dealershipConversationService'

export default function DealershipConversationsPage() {
  const { showToast } = useToast()
  const [params] = useSearchParams()
  const [threads, setThreads] = useState([])
  const [selectedId, setSelectedId] = useState(params.get('lead') || '')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [senderType, setSenderType] = useState('AI')

  const loadThreads = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await dealershipConversationService.getDealershipConversations()
      setThreads(rows)
      setSelectedId((current) => current || params.get('lead') || rows[0]?.id || '')
    } catch (err) {
      setThreads([])
      showToast(err.message || 'Unable to load conversations.', 'error')
    } finally {
      setLoading(false)
    }
  }, [params, showToast])

  const loadMessages = useCallback(
    async (leadId) => {
      if (!leadId) {
        setMessages([])
        return
      }
      try {
        setMessages(await dealershipConversationService.getDealershipConversation(leadId))
      } catch (err) {
        setMessages([])
        showToast(err.message || 'Unable to load messages.', 'error')
      }
    },
    [showToast],
  )

  useEffect(() => {
    const t = window.setTimeout(() => void loadThreads(), 0)
    return () => window.clearTimeout(t)
  }, [loadThreads])

  useEffect(() => {
    if (!selectedId) return undefined
    const t = window.setTimeout(() => void loadMessages(selectedId), 0)
    return () => window.clearTimeout(t)
  }, [selectedId, loadMessages])

  const send = async (e) => {
    e.preventDefault()
    if (!selectedId || !draft.trim()) return
    setSending(true)
    try {
      await dealershipConversationService.sendDealershipMessage(selectedId, {
        senderType,
        message: draft.trim(),
      })
      setDraft('')
      await loadMessages(selectedId)
    } catch (err) {
      showToast(err.message || 'Unable to send message.', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading conversations…" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Breadcrumbs />
      <PageHeader
        title="Conversations"
        description="Monitor AI and agent conversations for dealership leads."
      />
      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Lead conversations will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="max-h-[70vh] overflow-y-auto p-0">
            <ul>
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(thread.id)}
                    className={`w-full border-b border-[var(--border-default)] px-3 py-3 text-left hover:bg-[var(--bg-muted)] ${
                      selectedId === thread.id ? 'bg-[var(--brand-accent-soft)]' : ''
                    }`}
                  >
                    <p className="text-sm font-medium">{thread.customerName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{thread.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex max-h-[70vh] flex-col p-4">
            <div className="mb-3 border-b border-[var(--border-default)] pb-2">
              <p className="font-semibold">
                {threads.find((thread) => thread.id === selectedId)?.customerName || 'Thread'}
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
                      String(m.sender).toLowerCase().includes('customer')
                        ? 'ml-8 bg-[var(--bg-muted)]'
                        : 'mr-8 bg-[var(--brand-accent-soft)]'
                    }`}
                  >
                    <p className="text-[11px] font-medium uppercase text-[var(--text-muted)]">
                      {m.sender}
                    </p>
                    <p>{m.text}</p>
                    {m.timestamp ? (
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{m.timestamp}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            <form className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_auto]" onSubmit={send}>
              <Select
                value={senderType}
                onChange={(e) => setSenderType(e.target.value)}
                options={['AI', 'AGENT', 'CUSTOMER']}
              />
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message"
              />
              <Button type="submit" disabled={sending || !draft.trim()}>
                {sending ? <LoadingSpinner size={16} /> : 'Send'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
