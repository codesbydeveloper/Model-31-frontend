import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useToast } from '../../hooks/useToast'
import bdcEscalationService from '../../services/api/bdcEscalationService'
import BdcAssignModal from './BdcAssignModal'

export default function BdcEscalationsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolveTarget, setResolveTarget] = useState(null)
  const [resolveLoading, setResolveLoading] = useState(false)
  const [reassignTarget, setReassignTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await bdcEscalationService.getBdcEscalations())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load escalations.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const resolve = async () => {
    setResolveLoading(true)
    try {
      await bdcEscalationService.resolveBdcEscalation(
        resolveTarget.leadId || resolveTarget.id,
      )
      showToast('Escalation resolved.')
      setResolveTarget(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to resolve escalation.', 'error')
    } finally {
      setResolveLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Escalations"
        description="Review and resolve escalated leads requiring BDC attention."
      />

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'lead',
                label: 'Lead',
                render: (row) => (
                  <div>
                    <p className="font-medium">{row.leadId}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{row.vehicle}</p>
                  </div>
                ),
              },
              { key: 'customerName', label: 'Customer' },
              { key: 'reason', label: 'Reason' },
              { key: 'salesperson', label: 'Salesperson' },
              { key: 'time', label: 'Time' },
              {
                key: 'priority',
                label: 'Priority',
                render: (row) => <StatusBadge status={row.priority} />,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/bdc/conversations?lead=${row.leadId}`}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setReassignTarget({
                          id: row.leadId,
                          customerName: row.customerName,
                          vehicle: row.vehicle,
                          score: 0,
                          tier: 'B',
                          salesperson: row.salesperson,
                        })
                      }
                    >
                      Reassign
                    </Button>
                    {String(row.status).toUpperCase() !== 'RESOLVED' && (
                      <Button size="sm" onClick={() => setResolveTarget(row)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={rows}
            pageSize={10}
            emptyTitle="No escalations."
          />
        )}
      </Card>

      <ConfirmModal
        open={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        onConfirm={resolve}
        title="Resolve escalation"
        message={`Mark escalation for ${resolveTarget?.leadId} as resolved?`}
        confirmLabel="Resolve"
        loading={resolveLoading}
      />

      <BdcAssignModal
        open={Boolean(reassignTarget)}
        lead={reassignTarget}
        mode="reassign"
        onClose={() => setReassignTarget(null)}
        onDone={async () => {
          showToast('Lead reassigned successfully.')
          setReassignTarget(null)
          await load()
        }}
      />
    </div>
  )
}
