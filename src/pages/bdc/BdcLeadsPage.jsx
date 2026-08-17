import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import { useToast } from '../../hooks/useToast'
import bdcService from '../../services/mock/bdcService'
import BdcAssignModal from './BdcAssignModal'
import PipelineBadge from '../../components/common/PipelineBadge'

const TABS = ['All', 'Qualified', 'Assigned', 'Accepted', 'Expired', 'Escalated']

export default function BdcLeadsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(1)
  const [active, setActive] = useState(null)
  const [mode, setMode] = useState('assign')
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await bdcService.getBdcLeads())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (tab === 'All') return rows
    return rows.filter((row) => row.bdcStatus === tab.toUpperCase() || row.status === tab.toUpperCase())
  }, [rows, tab])

  const openAssign = (lead, nextMode) => {
    setActive(lead)
    setMode(nextMode)
    setModalOpen(true)
  }

  const escalate = async (lead) => {
    await bdcService.escalateLead(lead.id)
    showToast('Lead escalated.')
    await load()
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
          <Button size="sm" variant="ghost" onClick={() => escalate(row)}>
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
            rows={filtered}
            page={page}
            onPageChange={setPage}
            pageSize={10}
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
    </div>
  )
}
