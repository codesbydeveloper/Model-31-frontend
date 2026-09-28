import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { RecordFacts } from '../../components/model31/ReadOnlyRecord'
import { useToast } from '../../hooks/useToast'
import { getTrustInvoice, getTrustLineItem } from '../../services/api/trustPortalService'

function formatStamp(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

export default function TrustInvoicePage({ listPath }) {
  const { id } = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState({})
  const [lineItems, setLineItems] = useState([])
  const [proof, setProof] = useState(null)
  const [proofLoading, setProofLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTrustInvoice(id)
      setInvoice(result.invoice)
      setLineItems(result.lineItems)
    } catch (err) {
      setInvoice({})
      setLineItems([])
      setError(err.message || 'Unable to load this invoice.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const openProof = async (line) => {
    if (!line.id) {
      showToast('This line has no id, so the transcript cannot be opened.', 'error')
      return
    }
    setProofLoading(true)
    setProof({ line, transcript: [] })
    try {
      const result = await getTrustLineItem(line.id)
      setProof({ line, transcript: result.transcript, item: result.item })
    } catch (err) {
      setProof(null)
      showToast(err.message || 'Unable to load the proof.', 'error')
    } finally {
      setProofLoading(false)
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
      <div className="mb-3">
        <Link to={listPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back to invoices
          </Button>
        </Link>
      </div>
      <PageHeader
        title="Invoice proof"
        description="Influenced sales are $31 each. Open a line to see the message and the time."
      />

      {error ? (
        <ErrorState title="Invoice unavailable" description={error} onRetry={load} />
      ) : (
        <>
          <Card className="mb-4">
            <h2 className="mb-4 text-base font-semibold">Summary</h2>
            <RecordFacts record={invoice} />
          </Card>
          <Card>
            <h2 className="mb-4 text-base font-semibold">Line items</h2>
            <DataTable
              columns={[
                { key: 'stockNumber', label: 'Stock' },
                { key: 'vin', label: 'VIN' },
                { key: 'saleDate', label: 'Sale date' },
                {
                  key: 'influenced',
                  label: 'Influenced',
                  render: (row) => (row.influenced === true || row.influenced === 'true' ? 'Yes' : row.influenced === false || row.influenced === 'false' ? 'No' : row.influenced || '—'),
                },
                { key: 'events', label: 'Events' },
                {
                  key: 'amount',
                  label: 'Amount',
                  render: (row) => {
                    if (row.amount === '' || row.amount == null) return '—'
                    const text = String(row.amount)
                    return text.startsWith('$') ? text : `$${text}`
                  },
                },
                {
                  key: 'proof',
                  label: 'Proof',
                  render: (row) => (
                    <Button size="sm" variant="secondary" onClick={() => void openProof(row)}>
                      View message
                    </Button>
                  ),
                },
              ]}
              rows={lineItems}
              rowKey="_key"
              emptyTitle="No line items"
              emptyDescription="This invoice has no sold cars attached."
            />
          </Card>

          {proof ? (
            <Card className="mt-4">
              <h2 className="text-base font-semibold">
                Proof for stock {proof.line.stockNumber || '—'}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                VIN {proof.line.vin || '—'} · sale date {proof.line.saleDate || '—'}
              </p>
              {proofLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size={24} />
                </div>
              ) : proof.transcript.length ? (
                <ul className="mt-4 space-y-3">
                  {proof.transcript.map((entry) => (
                    <li
                      key={entry._key}
                      className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3"
                    >
                      <p className="text-xs text-[var(--text-muted)]">
                        {[entry.eventType, formatStamp(entry.timestamp)].filter(Boolean).join(' · ') || 'Message'}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">{entry.message || '—'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[var(--text-secondary)]">No transcript on this line item.</p>
              )}
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
