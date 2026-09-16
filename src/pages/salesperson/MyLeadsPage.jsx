import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import salespersonPortalService from '../../services/api/salespersonPortalService'
import PipelineBadge from '../../components/common/PipelineBadge'
import { PIPELINE_TYPES } from '../../utils/pipeline'

const TABS = ['All', 'New', 'Contacted', 'Appointment', 'Sold', 'Not Sold']
const PAGE_SIZE = 10

export default function MyLeadsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await salespersonPortalService.getMyLeads({
        page,
        limit: PAGE_SIZE,
        status: tab === 'All' ? '' : tab,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load leads.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, tab, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const from = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + rows.length

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="My Leads"
        description="Track and manage your assigned lead pipeline."
      />

      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item)
              setPage(1)
            }}
            className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${
              tab === item
                ? 'bg-[var(--brand-primary)] text-white'
                : 'border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="No leads found." description="Try another tab." />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((lead) => (
              <Card key={lead.id} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{lead.customerName}</h2>
                    <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                      {lead.vehicle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--brand-accent)]">
                      {lead.score}
                    </p>
                    <StatusBadge status={`Tier ${lead.tier}`} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-[var(--text-muted)]">Budget: </span>
                    {lead.budget || '—'}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Timeline: </span>
                    {lead.timeline || '—'}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Source: </span>
                    {lead.source || '—'}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Signature: </span>
                    {lead.pipelineType === PIPELINE_TYPES.MODEL31
                      ? '✓ VERIFIED'
                      : 'NOT APPLICABLE'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <PipelineBadge pipelineType={lead.pipelineType} />
                    <StatusBadge status={lead.status} />
                  </div>
                  <Link to={`/salesperson/leads/${lead.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          {totalItems > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>
                Showing {from}–{to} of {totalItems}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
