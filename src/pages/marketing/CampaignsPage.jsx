import { useCallback, useEffect, useMemo, useState } from 'react'
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
import campaignService from '../../services/mock/campaignService'
import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
} from '../../data/campaigns'
import { DEALERSHIPS, SOCIAL_PLATFORMS, AUDIENCES } from '../../data/marketingContent'

export default function CampaignsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    dealership: DEALERSHIPS[0],
    objective: CAMPAIGN_OBJECTIVES[0],
    platforms: ['Instagram', 'Facebook'],
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    budget: '10000',
    audience: AUDIENCES[0],
    description: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await campaignService.getCampaigns())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.dealership.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [rows, search, status])

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
          <Button onClick={() => setCreateOpen(true)}>
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
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...CAMPAIGN_STATUSES.map((s) => ({ value: s, label: s })),
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
                        {row.platforms.map((p) => (
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
                rows={filtered}
                pageSize={8}
                emptyTitle="No campaigns found."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.map((campaign) => (
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
              const created = await campaignService.createCampaign(form)
              setCreateOpen(false)
              showToast('Campaign created.')
              await load()
              navigate(`/marketing/campaigns/${created.id}`)
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
            value={form.dealership}
            onChange={(e) => setForm({ ...form, dealership: e.target.value })}
            options={DEALERSHIPS.map((d) => ({ value: d, label: d }))}
          />
          <Select
            label="Objective"
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
            options={CAMPAIGN_OBJECTIVES.map((d) => ({ value: d, label: d }))}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp').map((p) => (
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
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
            options={AUDIENCES.map((d) => ({ value: d, label: d }))}
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
            <Button type="submit" disabled={saving || form.platforms.length === 0}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Campaign'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
