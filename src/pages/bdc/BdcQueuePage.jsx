import { useCallback, useEffect, useState } from 'react'
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

export default function BdcQueuePage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await bdcService.getQueue())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const columns = [
    { key: 'id', label: 'Lead ID' },
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
      key: 'priority',
      label: 'Priority',
      render: (row) => <StatusBadge status={row.priority} />,
    },
    { key: 'location', label: 'Location' },
    { key: 'dealership', label: 'Dealership' },
    { key: 'created', label: 'Created' },
    { key: 'waitTime', label: 'Wait Time' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <Button
          size="sm"
          onClick={() => {
            setActive(row)
            setAssignOpen(true)
          }}
        >
          Assign
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Lead Dispatch Queue"
        description="Prioritized queue of qualified leads waiting for salesperson assignment."
      />
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Model 31 leads are excluded from the BDC queue.
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
            pageSize={10}
            emptyTitle="No leads waiting."
            emptyDescription="All qualified leads have been assigned."
          />
        )}
      </Card>

      <BdcAssignModal
        open={assignOpen}
        lead={active}
        onClose={() => setAssignOpen(false)}
        onDone={async () => {
          showToast('Lead assigned successfully.')
          setAssignOpen(false)
          await load()
        }}
      />
    </div>
  )
}
