import { useCallback, useEffect, useState } from 'react'
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
import { useToast } from '../../hooks/useToast'
import {
  FALLBACK_OPTIONS,
  getEventQuickView,
  getEvents,
} from '../../services/api/superAdminEventService'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export default function EventsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [options, setOptions] = useState(FALLBACK_OPTIONS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [eventType, setEventType] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [detail, setDetail] = useState(null)
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickLoading, setQuickLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getEvents({
        search: debouncedSearch,
        eventType,
        status,
        source,
        date,
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setOptions(result.options)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load events.', 'error')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, eventType, status, source, date, page, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const onFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const openQuickView = async (row) => {
    setQuickOpen(true)
    setQuickLoading(true)
    setDetail(null)
    try {
      setDetail(await getEventQuickView(row.id))
    } catch (err) {
      showToast(err.message || 'Unable to load event quick view.', 'error')
      setQuickOpen(false)
    } finally {
      setQuickLoading(false)
    }
  }

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Event ID..."
          />
          <Select
            value={eventType}
            onChange={onFilterChange(setEventType)}
            options={options.eventTypes}
          />
          <Select
            value={status}
            onChange={onFilterChange(setStatus)}
            options={options.statuses}
          />
          <Select
            value={source}
            onChange={onFilterChange(setSource)}
            options={options.sources}
          />
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={onFilterChange(setDate)}
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
                    <Button size="sm" onClick={() => void openQuickView(row)}>
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
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No events found."
          />
        )}
      </Card>

      <Modal
        open={quickOpen}
        onClose={() => !quickLoading && setQuickOpen(false)}
        title={detail?.title || 'Event Details'}
        className="max-w-lg"
      >
        {quickLoading || !detail ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            <Row label="Event ID" value={detail.id} />
            <Row label="Event Type" value={detail.eventType} />
            <Row label="Timestamp" value={detail.created} />
            <Row label="Source" value={detail.source} />
            <Row label="Entity" value={detail.entity} />
            <Row label="Payload Summary" value={detail.payloadSummary || '—'} />
            <Row label="Processing Status" value={detail.status} />
            <Row
              label="Duration"
              value={detail.durationMs == null ? '—' : `${detail.durationMs} ms`}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setQuickOpen(false)}>
                Close
              </Button>
              <Link
                to={`/super-admin/events/${detail.id}`}
                className="btn btn-sm btn-primary inline-flex items-center"
                onClick={() => setQuickOpen(false)}
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
