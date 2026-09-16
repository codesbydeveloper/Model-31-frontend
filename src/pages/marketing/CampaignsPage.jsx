import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/common/SearchInput'
import CampaignCard from '../../components/marketing/CampaignCard'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
} from '../../data/campaigns'
import { SOCIAL_PLATFORMS, AUDIENCES } from '../../data/marketingContent'
import { getCampaigns, createCampaign } from '../../services/api/marketingCampaignService'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

const EMPTY_FORM = {
  name: '',
  dealershipId: 'dlr_miami',
  objective: 'Lead Generation',
  platforms: ['Facebook', 'Instagram'],
  startDate: '2026-08-15',
  endDate: '2026-09-30',
  budget: '10000',
  targetAudience: 'Luxury Buyer',
  description: '',
}

export default function CampaignsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [dealerships, setDealerships] = useState([])
  const [objectives, setObjectives] = useState(CAMPAIGN_OBJECTIVES)
  const [platforms, setPlatforms] = useState(SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp'))
  const [audiences, setAudiences] = useState(AUDIENCES)
  const [statuses, setStatuses] = useState(CAMPAIGN_STATUSES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCampaigns({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.options.dealerships?.length) setDealerships(result.options.dealerships)
      if (result.options.objectives?.length) setObjectives(result.options.objectives)
      if (result.options.platforms?.length) setPlatforms(result.options.platforms)
      if (result.options.audiences?.length) setAudiences(result.options.audiences)
      if (result.options.statuses?.length) setStatuses(result.options.statuses)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load campaigns.', 'error')
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

  const togglePlatform = (platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Campaigns"
        description="Plan and monitor dealership marketing campaigns."
        actions={
          <Button
            onClick={() => {
              setForm({
                ...EMPTY_FORM,
                dealershipId: dealerships.find((d) => d.id === 'dlr_miami')?.id || dealerships[0]?.id || '',
                objective: objectives[0] || 'Lead Generation',
                targetAudience: audiences[0] || 'Luxury Buyer',
              })
              setCreateOpen(true)
            }}
          >
            <Plus size={16} />
            Create Campaign
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...statuses.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={[
                  { key: 'name', label: 'Campaign' },
                  { key: 'dealership', label: 'Dealership' },
                  { key: 'objective', label: 'Objective' },
                  {
                    key: 'platforms',
                    label: 'Platforms',
                    render: (row) => (
                      <div className="flex flex-wrap gap-1">
                        {(row.platforms || []).map((p) => (
                          <PlatformBadge key={p} platform={p} />
                        ))}
                      </div>
                    ),
                  },
                  { key: 'startDate', label: 'Start Date' },
                  { key: 'endDate', label: 'End Date' },
                  {
                    key: 'budget',
                    label: 'Budget',
                    render: (row) => `$${formatNumber(row.budget)}`,
                  },
                  { key: 'contentCount', label: 'Content' },
                  { key: 'leads', label: 'Leads' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (row) => (
                      <Link to={`/marketing/campaigns/${row.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    ),
                  },
                ]}
                rows={rows}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                totalItems={totalItems}
                showPagination
                emptyTitle="No campaigns found."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {rows.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Campaign" className="max-w-lg">
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            try {
              const created = await createCampaign(form)
              setCreateOpen(false)
              setForm(EMPTY_FORM)
              showToast('Campaign created.')
              await load()
              if (created?.id) navigate(`/marketing/campaigns/${created.id}`)
            } catch (err) {
              showToast(err.message || 'Unable to create campaign.', 'error')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Input
            label="Campaign Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="Dealership"
            value={form.dealershipId}
            onChange={(e) => setForm({ ...form, dealershipId: e.target.value })}
            options={dealerships.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            label="Objective"
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
            options={objectives.map((d) => ({ value: d, label: d }))}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={form.platforms.includes(p) ? 'primary' : 'secondary'}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
          <Input
            label="Budget"
            type="number"
            min="0"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            required
          />
          <Select
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            options={audiences.map((d) => ({ value: d, label: d }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="input-field min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || form.platforms.length === 0 || !form.name.trim()}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Campaign'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
