import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import ContentCard from '../../components/marketing/ContentCard'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import {
  CONTENT_TYPES,
  CONTENT_STATUSES,
  SOCIAL_PLATFORMS,
  DEALERSHIPS,
} from '../../data/marketingContent'
import marketingContentService from '../../services/mock/marketingContentService'
import campaignService from '../../services/mock/campaignService'
import { formatNumber } from '../../utils/table'

const EMPTY = {
  contentType: 'all',
  platform: 'all',
  dealership: 'all',
  status: 'all',
  campaign: 'all',
}

export default function MarketingContentPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [list, camps] = await Promise.all([
        marketingContentService.getContent(),
        campaignService.getCampaigns(),
      ])
      setRows(list)
      setCampaigns(camps)
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
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.dealership.toLowerCase().includes(q),
      )
    }
    if (filters.contentType !== 'all') {
      list = list.filter((r) => r.contentType === filters.contentType)
    }
    if (filters.platform !== 'all') list = list.filter((r) => r.platform === filters.platform)
    if (filters.dealership !== 'all') {
      list = list.filter((r) => r.dealership === filters.dealership)
    }
    if (filters.status !== 'all') list = list.filter((r) => r.status === filters.status)
    if (filters.campaign !== 'all') list = list.filter((r) => r.campaign === filters.campaign)
    return list
  }, [rows, search, filters])

  const clearFilters = () => {
    setSearch('')
    setFilters(EMPTY)
    setPage(1)
  }

  const onDuplicate = async (item) => {
    await marketingContentService.duplicateContent(item.id)
    showToast('Content duplicated.')
    await load()
  }

  const onSubmit = async (item) => {
    await marketingContentService.submitForApproval(item.id)
    showToast('Submitted for approval.')
    await load()
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await marketingContentService.deleteContent(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Content deleted.')
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="AI Content"
        description="Create and manage AI-generated dealership marketing content."
        actions={
          <Button onClick={() => navigate('/marketing/content/create')}>
            <Plus size={16} />
            Create Content
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search content..."
            className="md:col-span-2 xl:col-span-1"
          />
          <Select
            value={filters.contentType}
            onChange={(e) => setFilters((f) => ({ ...f, contentType: e.target.value }))}
            options={[
              { value: 'all', label: 'All content types' },
              ...CONTENT_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={filters.platform}
            onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
            options={[
              { value: 'all', label: 'All platforms' },
              ...SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp').map((t) => ({
                value: t,
                label: t,
              })),
            ]}
          />
          <Select
            value={filters.dealership}
            onChange={(e) => setFilters((f) => ({ ...f, dealership: e.target.value }))}
            options={[
              { value: 'all', label: 'All dealerships' },
              ...DEALERSHIPS.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'all', label: 'All statuses' },
              ...CONTENT_STATUSES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={filters.campaign}
            onChange={(e) => setFilters((f) => ({ ...f, campaign: e.target.value }))}
            options={[
              { value: 'all', label: 'All campaigns' },
              ...campaigns.map((c) => ({ value: c.name, label: c.name })),
            ]}
          />
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
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
                  { key: 'title', label: 'Title' },
                  { key: 'contentType', label: 'Content Type' },
                  { key: 'dealership', label: 'Dealership' },
                  {
                    key: 'platform',
                    label: 'Platform',
                    render: (row) => <PlatformBadge platform={row.platform} />,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  { key: 'createdBy', label: 'Created By' },
                  { key: 'createdDate', label: 'Created Date' },
                  {
                    key: 'scheduledDate',
                    label: 'Scheduled Date',
                    render: (row) => row.scheduledDate || '—',
                  },
                  {
                    key: 'performance',
                    label: 'Performance',
                    render: (row) =>
                      `${formatNumber(row.performance?.reach || 0)} reach`,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (row) => (
                      <div className="flex flex-wrap gap-1">
                        <Link to={`/marketing/content/${row.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                        <Link to={`/marketing/content/${row.id}?edit=1`}>
                          <Button size="sm" variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="secondary" onClick={() => onDuplicate(row)}>
                          Duplicate
                        </Button>
                        {(row.status === 'DRAFT' || row.status === 'REJECTED') && (
                          <Button size="sm" onClick={() => onSubmit(row)}>
                            Submit for Approval
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                rows={filtered}
                page={page}
                onPageChange={setPage}
                pageSize={8}
                emptyTitle="No content found."
                emptyActionLabel="Clear Filters"
                onEmptyAction={clearFilters}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.slice((page - 1) * 8, page * 8).map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onView={() => navigate(`/marketing/content/${item.id}`)}
                  onEdit={() => navigate(`/marketing/content/${item.id}?edit=1`)}
                  onDuplicate={onDuplicate}
                  onSubmit={onSubmit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete content?"
        message="This will remove the content from the library."
        confirmLabel="Delete"
        danger
        loading={busy}
      />
    </div>
  )
}
