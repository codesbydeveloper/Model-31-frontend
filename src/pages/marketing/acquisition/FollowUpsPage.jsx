import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import Modal from '../../../components/common/Modal'
import Input from '../../../components/common/Input'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../hooks/useToast'
import { formatNumber, formatPercent } from '../../../utils/table'
import {
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_TRIGGERS,
} from '../../../data/followUpSequences'
import {
  getFollowUps,
  createFollowUp,
  pauseFollowUp,
  resumeFollowUp,
} from '../../../services/api/marketingFollowUpService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

const EMPTY_FORM = {
  name: '',
  description: '',
  targetAudience: '',
  trigger: FOLLOW_UP_TRIGGERS[0],
  status: 'DRAFT',
}

export default function FollowUpsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFollowUps({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load follow-up sequences.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await createFollowUp(form)
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      showToast('Follow-up sequence created.')
      await load()
      if (created?.id) {
        navigate(`/marketing/acquisition/follow-ups/${created.id}`)
      }
    } catch (err) {
      showToast(err.message || 'Unable to create sequence.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const togglePause = async (row) => {
    setTogglingId(row.id)
    try {
      if (row.status === 'PAUSED') {
        await resumeFollowUp(row.id)
        showToast('Sequence resumed.')
      } else {
        await pauseFollowUp(row.id)
        showToast('Sequence paused.')
      }
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update sequence.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Follow-Ups"
        description="Create and manage automated acquisition follow-up sequences."
        actions={
          <Button
            onClick={() => {
              setForm(EMPTY_FORM)
              setCreateOpen(true)
            }}
          >
            <Plus size={16} />
            Create Sequence
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sequences..."
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...FOLLOW_UP_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Sequence',
                render: (row) => (
                  <Link
                    to={`/marketing/acquisition/follow-ups/${row.id}`}
                    className="font-medium text-[var(--brand-accent)] hover:underline"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: 'audience',
                label: 'Audience',
                render: (row) => row.targetAudience || row.audience,
              },
              { key: 'trigger', label: 'Trigger' },
              {
                key: 'steps',
                label: 'Steps',
                render: (row) => formatNumber(row.stepCount),
              },
              {
                key: 'activeLeads',
                label: 'Active',
                render: (row) => formatNumber(row.activeLeads),
              },
              {
                key: 'completed',
                label: 'Completed',
                render: (row) => formatNumber(row.completed),
              },
              {
                key: 'conversion',
                label: 'Conversion',
                render: (row) => formatPercent(row.conversion),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/marketing/acquisition/follow-ups/${row.id}`}>
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                    {(row.status === 'ACTIVE' || row.status === 'PAUSED') && (
                      <Button
                        size="sm"
                        disabled={togglingId === row.id}
                        onClick={() => void togglePause(row)}
                      >
                        {togglingId === row.id ? (
                          <LoadingSpinner size={16} />
                        ) : row.status === 'PAUSED' ? (
                          'Resume'
                        ) : (
                          'Pause'
                        )}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No follow-up sequences found."
          />
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Sequence"
        className="max-w-lg"
      >
        <form className="grid gap-3" onSubmit={onCreate}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="input-field min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            required
          />
          <Select
            label="Trigger"
            value={form.trigger}
            onChange={(e) => setForm({ ...form, trigger: e.target.value })}
            options={FOLLOW_UP_TRIGGERS.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'DRAFT', label: 'DRAFT' },
              { value: 'ACTIVE', label: 'ACTIVE' },
              { value: 'PAUSED', label: 'PAUSED' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Sequence'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
