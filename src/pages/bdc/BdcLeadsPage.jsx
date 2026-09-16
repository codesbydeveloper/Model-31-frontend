import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import { useToast } from '../../hooks/useToast'
import bdcLeadService from '../../services/api/bdcLeadService'
import BdcAssignModal from './BdcAssignModal'
import PipelineBadge from '../../components/common/PipelineBadge'

const TABS = ['All', 'Qualified', 'Assigned', 'Accepted', 'Expired', 'Escalated']
const PAGE_SIZE = 10

export default function BdcLeadsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [active, setActive] = useState(null)
  const [mode, setMode] = useState('assign')
  const [modalOpen, setModalOpen] = useState(false)
  const [escalateLead, setEscalateLead] = useState(null)
  const [escalateForm, setEscalateForm] = useState({
    reason: 'No response',
    priority: 'HIGH',
  })
  const [escalating, setEscalating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await bdcLeadService.getBdcLeads({
        page,
        limit: PAGE_SIZE,
        status: tab === 'All' ? '' : tab.toUpperCase(),
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

  const openAssign = (lead, nextMode) => {
    setActive(lead)
    setMode(nextMode)
    setModalOpen(true)
  }

  const submitEscalate = async () => {
    if (!escalateLead) return
    setEscalating(true)
    try {
      await bdcLeadService.escalateBdcLead(escalateLead.id, escalateForm)
      showToast('Lead escalated.')
      setEscalateLead(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to escalate lead.', 'error')
    } finally {
      setEscalating(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Lead ID',
      render: (row) => (
        <Link
          to={`/bdc/conversations?lead=${row.id}`}
          className="font-medium text-[var(--brand-accent)] hover:underline"
        >
          {row.id}
        </Link>
      ),
    },
    { key: 'customerName', label: 'Customer' },
    {
      key: 'pipelineType',
      label: 'Pipeline',
      render: (row) => <PipelineBadge pipelineType={row.pipelineType} />,
    },
    { key: 'source', label: 'Source' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'score', label: 'Score' },
    {
      key: 'tier',
      label: 'Tier',
      render: (row) => <StatusBadge status={`Tier ${row.tier}`} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.bdcStatus || row.status} />,
    },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'created', label: 'Created' },
    { key: 'responseTime', label: 'Response Time' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Link to={`/bdc/conversations?lead=${row.id}`}>
            <Button size="sm" variant="ghost">
              View
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => openAssign(row, 'assign')}>
            Assign
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openAssign(row, 'reassign')}>
            Reassign
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEscalateForm({ reason: 'No response', priority: 'HIGH' })
              setEscalateLead(row)
            }}
          >
            Escalate
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Qualified Leads"
        description="Review and manage BDC lead dispatch states."
      />
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Model 31 leads are excluded from the BDC queue.
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item)
              setPage(1)
            }}
            className={`shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium ${
              tab === item
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No leads in this tab."
          />
        )}
      </Card>

      <BdcAssignModal
        open={modalOpen}
        lead={active}
        mode={mode}
        onClose={() => setModalOpen(false)}
        onDone={async () => {
          showToast(
            mode === 'reassign'
              ? 'Lead reassigned successfully.'
              : 'Lead assigned successfully.',
          )
          setModalOpen(false)
          await load()
        }}
      />

      <Modal
        open={Boolean(escalateLead)}
        onClose={() => !escalating && setEscalateLead(null)}
        title="Escalate Lead"
      >
        <Input
          label="Reason"
          value={escalateForm.reason}
          onChange={(e) => setEscalateForm({ ...escalateForm, reason: e.target.value })}
        />
        <Select
          label="Priority"
          value={escalateForm.priority}
          onChange={(e) => setEscalateForm({ ...escalateForm, priority: e.target.value })}
          options={['HIGH', 'MEDIUM', 'LOW']}
          containerClassName="mt-3"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={escalating} onClick={() => setEscalateLead(null)}>
            Cancel
          </Button>
          <Button disabled={escalating || !escalateForm.reason.trim()} onClick={submitEscalate}>
            {escalating ? <LoadingSpinner size={16} /> : 'Escalate'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
