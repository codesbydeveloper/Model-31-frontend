import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import eventService from '../../services/mock/eventService'

export default function EventDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setItem(await eventService.getEventById(id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={load} />
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Event not found</h1>
        <Link to="/super-admin/events" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.eventType}
        description={item.id}
        actions={<StatusBadge status={item.status} />}
      />
      <Card>
        <dl className="space-y-2 text-sm">
          <Row label="Event ID" value={item.id} />
          <Row label="Event Type" value={item.eventType} />
          <Row label="Timestamp" value={item.created} />
          <Row label="Source" value={item.source} />
          <Row label="Entity" value={item.entity} />
          <Row label="Payload Summary" value={item.payloadSummary} />
          <Row label="Processing Status" value={item.status} />
          <Row
            label="Duration"
            value={item.durationMs == null ? '—' : `${item.durationMs} ms`}
          />
          <Row label="Processed" value={item.processed || '—'} />
        </dl>
      </Card>
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
