import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import eventService from '../../services/mock/eventService'
import { EVENT_TYPES, EVENT_STATUSES } from '../../data/events'

export default function EventsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [source, setSource] = useState('all')
  const [date, setDate] = useState('')
  const [detail, setDetail] = useState(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await eventService.getEvents())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const sources = useMemo(() => [...new Set(rows.map((r) => r.source))].sort(), [rows])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.id.toLowerCase().includes(q))
    }
    if (type !== 'all') list = list.filter((r) => r.eventType === type)
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (source !== 'all') list = list.filter((r) => r.source === source)
    if (date) list = list.filter((r) => r.created.startsWith(date))
    return list
  }, [rows, search, type, status, source, date])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Event Monitor"
        description="Monitor platform events and automation activity."
      />
      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search Event ID..."
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'all', label: 'All event types' },
              ...EVENT_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...EVENT_STATUSES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { value: 'all', label: 'All sources' },
              ...sources.map((s) => ({ value: s, label: s })),
            ]}
          />
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Filter by date"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'Event ID' },
              { key: 'eventType', label: 'Event Type' },
              { key: 'source', label: 'Source' },
              { key: 'entity', label: 'Entity' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'created', label: 'Created' },
              {
                key: 'processed',
                label: 'Processed',
                render: (row) => row.processed || '—',
              },
              {
                key: 'durationMs',
                label: 'Duration',
                render: (row) => (row.durationMs == null ? '—' : `${row.durationMs} ms`),
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setDetail(row)}>
                      Quick view
                    </Button>
                    <Link
                      to={`/super-admin/events/${row.id}`}
                      className="btn btn-sm btn-secondary inline-flex items-center"
                    >
                      Open
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={10}
            emptyTitle="No events found."
          />
        )}
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Event Details"
        className="max-w-lg"
      >
        {detail && (
          <dl className="space-y-2 text-sm">
            <Row label="Event ID" value={detail.id} />
            <Row label="Event Type" value={detail.eventType} />
            <Row label="Timestamp" value={detail.created} />
            <Row label="Source" value={detail.source} />
            <Row label="Entity" value={detail.entity} />
            <Row label="Payload Summary" value={detail.payloadSummary} />
            <Row label="Processing Status" value={detail.status} />
            <Row
              label="Duration"
              value={detail.durationMs == null ? '—' : `${detail.durationMs} ms`}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
              <Link
                to={`/super-admin/events/${detail.id}`}
                className="btn btn-sm btn-primary inline-flex items-center"
                onClick={() => setDetail(null)}
              >
                Full details
              </Link>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
