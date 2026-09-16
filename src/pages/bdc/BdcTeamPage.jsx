import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DataTable from '../../components/common/DataTable'
import Select from '../../components/common/Select'
import { formatNumber, sortBy } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import bdcTeamService from '../../services/api/bdcTeamService'

export default function BdcTeamPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await bdcTeamService.getBdcTeam({ sort: sortKey }))
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load team performance.', 'error')
    } finally {
      setLoading(false)
    }
  }, [sortKey, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const sorted = useMemo(
    () => sortBy(rows, sortKey, sortDir),
    [rows, sortKey, sortDir],
  )

  const totals = useMemo(
    () => ({
      assigned: rows.reduce((sum, r) => sum + r.assigned, 0),
      accepted: rows.reduce((sum, r) => sum + r.accepted, 0),
      sold: rows.reduce((sum, r) => sum + r.sold, 0),
      online: rows.filter((r) => String(r.status).toUpperCase() === 'ONLINE').length,
    }),
    [rows],
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Team Performance"
        description="Monitor salesperson productivity and response performance."
        actions={
          <Select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(':')
              setSortKey(key)
              setSortDir(dir)
            }}
            options={[
              { value: 'name:asc', label: 'Name A → Z' },
              { value: 'accepted:desc', label: 'Accepted high → low' },
              { value: 'assigned:desc', label: 'Assigned high → low' },
              { value: 'sold:desc', label: 'Sold high → low' },
            ]}
            className="w-48"
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Online Salespeople" value={formatNumber(totals.online)} />
        <StatCard label="Assigned Leads" value={formatNumber(totals.assigned)} />
        <StatCard label="Accepted Leads" value={formatNumber(totals.accepted)} />
        <StatCard label="Sold" value={formatNumber(totals.sold)} />
      </div>

      <Card className="mt-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Salesperson', sortable: true },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'assigned', label: 'Assigned Leads', sortable: true },
              { key: 'accepted', label: 'Accepted Leads', sortable: true },
              { key: 'declined', label: 'Declined' },
              { key: 'expired', label: 'Expired' },
              { key: 'appointments', label: 'Appointments' },
              { key: 'sold', label: 'Sold', sortable: true },
              { key: 'responseTime', label: 'Response Time' },
            ]}
            rows={sorted}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={(key) => {
              if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
              else {
                setSortKey(key)
                setSortDir('desc')
              }
            }}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  )
}
