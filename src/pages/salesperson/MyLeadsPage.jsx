import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import salespersonService from '../../services/mock/salespersonService'

const TABS = ['All', 'New', 'Contacted', 'Appointment', 'Sold', 'Not Sold']

export default function MyLeadsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await salespersonService.getMyLeads('sp_001'))
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
    const map = {
      New: 'NEW',
      Contacted: 'CONTACTED',
      Appointment: 'APPOINTMENT',
      Sold: 'SOLD',
      'Not Sold': 'NOT SOLD',
    }
    return rows.filter((row) => row.status === map[tab])
  }, [rows, tab])

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
            onClick={() => setTab(item)}
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
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState title="No leads found." description="Try another tab." />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
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
                  {lead.budget}
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Timeline: </span>
                  {lead.timeline}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge status={lead.status} />
                <Link to={`/salesperson/leads/${lead.id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
