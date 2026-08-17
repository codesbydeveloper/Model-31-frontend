import { useCallback, useEffect, useMemo, useState } from 'react'
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
import lifeEventService from '../../../services/mock/lifeEventService'
import acquisitionService from '../../../services/mock/acquisitionService'

export default function LifeEventsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [dismissing, setDismissing] = useState(null)
  const [dismissLoading, setDismissLoading] = useState(false)
  const [creatingId, setCreatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await lifeEventService.getLifeEvents())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.lifeEvent.toLowerCase().includes(q) ||
          r.vehicleNeed.toLowerCase().includes(q),
      )
    }
    if (eventType !== 'all') list = list.filter((r) => r.lifeEvent === eventType)
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [rows, search, eventType, status])

  const confirmDismiss = async () => {
    if (!dismissing) return
    setDismissLoading(true)
    try {
      await lifeEventService.dismissLifeEvent(dismissing.id)
      showToast('Life event dismissed.')
      setDismissing(null)
      setDetail(null)
      await load()
    } finally {
      setDismissLoading(false)
    }
  }

  const createLead = async (row) => {
    setCreatingId(row.id)
    try {
      const lead = await acquisitionService.createMockLeadFromSignal({
        customerName: row.customerName,
        source: 'Life Event',
        intent: row.intent,
        vehicle: 'SUV',
        location: 'Miami',
        score: row.intent === 'HIGH' ? 84 : 70,
      })
      await lifeEventService.markLifeEventLeadCreated(row.id, lead.id)
      showToast('Mock lead created successfully.')
      setDetail(null)
      await load()
    } finally {
      setCreatingId(null)
    }
  }

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
            onChange={(e) => setEventType(e.target.value)}
            options={[
              { value: 'all', label: 'All event types' },
              ...LIFE_EVENT_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
                    <Button size="sm" variant="secondary" onClick={() => setDetail(row)}>
                      Details
                    </Button>
                    {row.status !== 'DISMISSED' && row.status !== 'LEAD CREATED' && (
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
                            'Create Mock Lead'
                          )}
                        </Button>
                      </>
                    )}
                    {row.leadId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => showToast(`Lead linked: ${row.leadId}`)}
                      >
                        Lead Linked
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            pageSize={8}
            onPageChange={setPage}
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
        {detail && (
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
              value={detail.leadId ? `Lead linked: ${detail.leadId}` : 'None'}
            />
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              {detail.status !== 'DISMISSED' && detail.status !== 'LEAD CREATED' && (
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
                      'Create Mock Lead'
                    )}
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
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
      <p className="mt-0.5 font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
