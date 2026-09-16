import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import Modal from '../../../components/common/Modal'
import ConfirmModal from '../../../components/common/ConfirmModal'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../hooks/useToast'
import {
  LIFE_EVENT_TYPES,
  LIFE_EVENT_STATUSES,
} from '../../../data/lifeEvents'
import {
  getLifeEvents,
  getLifeEvent,
  dismissLifeEvent,
  createLifeEventLead,
  getLifeEventLinkedLead,
} from '../../../services/api/marketingLifeEventService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

export default function LifeEventsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [eventType, setEventType] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dismissing, setDismissing] = useState(null)
  const [dismissLoading, setDismissLoading] = useState(false)
  const [creatingId, setCreatingId] = useState(null)
  const [linkingId, setLinkingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getLifeEvents({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        eventType,
        status,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load life events.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, eventType, status, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const openDetails = async (row) => {
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await getLifeEvent(row.id)
      if (full) setDetail(full)
    } catch (err) {
      showToast(err.message || 'Unable to load details.', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const confirmDismiss = async () => {
    if (!dismissing) return
    setDismissLoading(true)
    try {
      await dismissLifeEvent(dismissing.id)
      showToast('Life event dismissed.')
      setDismissing(null)
      setDetail(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to dismiss life event.', 'error')
    } finally {
      setDismissLoading(false)
    }
  }

  const createLead = async (row) => {
    setCreatingId(row.id)
    try {
      await createLifeEventLead(row.id)
      showToast('Lead created successfully.')
      setDetail(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to create lead.', 'error')
    } finally {
      setCreatingId(null)
    }
  }

  const showLinkedLead = async (row) => {
    setLinkingId(row.id)
    try {
      const linked = await getLifeEventLinkedLead(row.id)
      showToast(`Lead linked: ${linked.leadLabel || row.leadId || row.leadLabel}`)
    } catch (err) {
      showToast(err.message || 'No lead linked to this life event', 'error')
    } finally {
      setLinkingId(null)
    }
  }

  const canAct = (row) => row.status !== 'DISMISSED' && row.status !== 'LEAD CREATED'

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Life Events"
        description="Spot life changes that may signal a vehicle need."
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search life events..."
          />
          <Select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All event types' },
              ...LIFE_EVENT_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...LIFE_EVENT_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'lifeEvent', label: 'Life Event' },
              { key: 'detectedFrom', label: 'Detected From' },
              { key: 'date', label: 'Date' },
              { key: 'vehicleNeed', label: 'Vehicle Need' },
              {
                key: 'intent',
                label: 'Intent',
                render: (row) => <StatusBadge status={row.intent} />,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="secondary" onClick={() => void openDetails(row)}>
                      Details
                    </Button>
                    {canAct(row) && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setDismissing(row)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          disabled={creatingId === row.id}
                          onClick={() => void createLead(row)}
                        >
                          {creatingId === row.id ? (
                            <LoadingSpinner size={16} />
                          ) : (
                            'Create Lead'
                          )}
                        </Button>
                      </>
                    )}
                    {row.leadLinked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={linkingId === row.id}
                        onClick={() => void showLinkedLead(row)}
                      >
                        {linkingId === row.id ? <LoadingSpinner size={16} /> : 'Lead Linked'}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No life events found."
          />
        )}
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.customerName || 'Life Event'}
        className="max-w-lg"
      >
        {detailLoading && !detail?.customerSignal ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : detail ? (
          <div className="grid gap-3 text-sm">
            <Info label="Life Event" value={detail.lifeEvent} />
            <Info label="Detected From" value={detail.detectedFrom} />
            <Info label="Date" value={detail.date} />
            <Info label="Vehicle Need" value={detail.vehicleNeed} />
            <Info label="Customer Signal" value={detail.customerSignal} />
            <Info label="Intent" value={<StatusBadge status={detail.intent} />} />
            <Info label="Status" value={<StatusBadge status={detail.status} />} />
            <Info
              label="Lead"
              value={
                detail.leadLinked || detail.leadId
                  ? `Lead linked: ${detail.leadLabel || detail.leadId}`
                  : 'None'
              }
            />
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              {canAct(detail) && (
                <>
                  <Button variant="secondary" onClick={() => setDismissing(detail)}>
                    Dismiss
                  </Button>
                  <Button
                    disabled={creatingId === detail.id}
                    onClick={() => void createLead(detail)}
                  >
                    {creatingId === detail.id ? (
                      <LoadingSpinner size={16} />
                    ) : (
                      'Create Lead'
                    )}
                  </Button>
                </>
              )}
              {detail.leadLinked && (
                <Button
                  variant="secondary"
                  disabled={linkingId === detail.id}
                  onClick={() => void showLinkedLead(detail)}
                >
                  Lead Linked
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={!!dismissing}
        onClose={() => setDismissing(null)}
        onConfirm={confirmDismiss}
        title="Dismiss life event"
        message={`Dismiss the ${dismissing?.lifeEvent} signal for ${dismissing?.customerName}?`}
        confirmLabel="Dismiss"
        loading={dismissLoading}
        danger
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 font-medium text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  )
}
