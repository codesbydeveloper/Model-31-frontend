import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PipelineBadge from '../../components/common/PipelineBadge'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import { LEAD_STATUSES } from '../../data/leads'
import dealershipLeadService from '../../services/api/dealershipLeadService'
import dealershipSalespersonService from '../../services/api/dealershipSalespersonService'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export default function DealershipLeadsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusLead, setStatusLead] = useState(null)
  const [assignLead, setAssignLead] = useState(null)
  const [statusValue, setStatusValue] = useState('NEW')
  const [people, setPeople] = useState([])
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dealershipLeadService.getDealershipLeads({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
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
  }, [page, debouncedSearch, showToast])

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

  const openAssign = async (lead) => {
    setAssignLead(lead)
    setSelectedPerson(null)
    try {
      const result = await dealershipSalespersonService.getDealershipSalespeople({
        page: 1,
        limit: 50,
      })
      setPeople(result.items)
    } catch (err) {
      setPeople([])
      showToast(err.message || 'Unable to load salespeople.', 'error')
    }
  }

  const saveStatus = async () => {
    if (!statusLead) return
    setSaving(true)
    try {
      await dealershipLeadService.updateDealershipLeadStatus(statusLead.id, statusValue)
      showToast('Lead status updated.')
      setStatusLead(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update status.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveAssign = async (salespersonId) => {
    if (!assignLead) return
    setSaving(true)
    try {
      await dealershipLeadService.assignDealershipLead(assignLead.id, salespersonId)
      showToast(salespersonId ? 'Salesperson assigned.' : 'Salesperson unassigned.')
      setAssignLead(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to assign salesperson.', 'error')
    } finally {
      setSaving(false)
    }
  }

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
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'salesperson',
        label: 'Salesperson',
        render: (row) => row.salesperson || 'Unassigned',
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            <Link to={`/dealership/conversations?lead=${row.id}`}>
              <Button size="sm" variant="ghost">
                View
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStatusValue(row.status)
                setStatusLead(row)
              }}
            >
              Status
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openAssign(row)}>
              Assign
            </Button>
          </div>
        ),
      },
    ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealership Leads"
        description="Monitor and manage leads for this dealership."
      />
      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="sm:max-w-xs"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            onPageChange={setPage}
            emptyTitle="No leads found"
            emptyDescription="Qualified and incoming leads for this dealership will appear here."
          />
        )}
      </Card>
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Showing {formatNumber(rows.length)} of {formatNumber(totalItems)} dealership leads.
      </p>

      <Modal
        open={Boolean(statusLead)}
        onClose={() => !saving && setStatusLead(null)}
        title="Change Status"
      >
        <Select
          label="Lead Status"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          options={LEAD_STATUSES}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={saving} onClick={() => setStatusLead(null)}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={saveStatus}>
            {saving ? <LoadingSpinner size={16} /> : 'Update Status'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(assignLead)}
        onClose={() => !saving && setAssignLead(null)}
        title="Assign Salesperson"
      >
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelectedPerson(person)}
              className={`flex w-full items-start justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left ${
                selectedPerson?.id === person.id
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
                  : 'border-[var(--border-default)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{person.email}</p>
              </div>
              <StatusBadge status={person.status} />
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={saving} onClick={() => setAssignLead(null)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => saveAssign(null)}
          >
            Unassign
          </Button>
          <Button
            disabled={!selectedPerson || saving}
            onClick={() => saveAssign(selectedPerson.id)}
          >
            {saving ? <LoadingSpinner size={16} /> : 'Assign'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
