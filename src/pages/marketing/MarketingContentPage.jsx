import { useCallback, useEffect, useState } from 'react'
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
import Modal from '../../components/common/Modal'
import ContentCard from '../../components/marketing/ContentCard'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import {
  CONTENT_TYPES,
  CONTENT_STATUSES,
  SOCIAL_PLATFORMS,
} from '../../data/marketingContent'
import {
  getMarketingContent,
  getContentCreateOptions,
  getMarketingSalespeople,
  duplicateMarketingContent,
  sendScriptToSalesperson,
  deleteMarketingContent,
} from '../../services/api/marketingContentService'
import { formatNumber } from '../../utils/table'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

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
  const [totalItems, setTotalItems] = useState(0)
  const [dealerships, setDealerships] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [contentTypes, setContentTypes] = useState(CONTENT_TYPES)
  const [platforms, setPlatforms] = useState(
    SOCIAL_PLATFORMS.filter((item) => item !== 'WhatsApp'),
  )
  const [statuses, setStatuses] = useState(CONTENT_STATUSES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [sendTarget, setSendTarget] = useState(null)
  const [sendSalespeople, setSendSalespeople] = useState([])
  const [sendSalespersonId, setSendSalespersonId] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionId, setActionId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMarketingContent({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: filters.status,
        platform: filters.platform,
        contentType: filters.contentType,
        dealershipId: filters.dealership,
        campaignId: filters.campaign,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load content.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters, showToast])

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

  useEffect(() => {
    const t = window.setTimeout(async () => {
      try {
        const options = await getContentCreateOptions()
        setDealerships(options.dealerships)
        setCampaigns(options.campaigns)
        if (options.contentTypes?.length) setContentTypes(options.contentTypes)
        if (options.platforms?.length) setPlatforms(options.platforms)
        if (options.statuses?.length) setStatuses(options.statuses)
      } catch {
        setDealerships([])
        setCampaigns([])
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setFilters(EMPTY)
    setPage(1)
  }

  const onDuplicate = async (item) => {
    setActionId(item.id)
    try {
      await duplicateMarketingContent(item.id)
      showToast('Content duplicated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to duplicate content.', 'error')
    } finally {
      setActionId(null)
    }
  }

  const openSend = async (item) => {
    setSendTarget(item)
    setSendSalespersonId('')
    setSendSalespeople([])
    setSendLoading(true)
    try {
      const list = await getMarketingSalespeople(item.dealershipId)
      setSendSalespeople(list)
      if (list.length === 1) setSendSalespersonId(list[0].id)
    } catch (err) {
      showToast(err.message || 'Unable to load salespeople.', 'error')
    } finally {
      setSendLoading(false)
    }
  }

  const onSubmit = async (item, salespersonId = sendSalespersonId) => {
    const trimmedId = String(salespersonId || '').trim()
    if (!trimmedId) {
      showToast('Select a salesperson to send this script.', 'error')
      return
    }
    setActionId(item.id)
    try {
      await sendScriptToSalesperson(item.id, { salespersonId: trimmedId })
      setSendTarget(null)
      setSendSalespersonId('')
      showToast('Script sent to the salesperson.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to send script.', 'error')
    } finally {
      setActionId(null)
    }
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteMarketingContent(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Content deleted.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete content.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const actionColumns = [
    {
      key: 'title',
      label: 'Title',
    },
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
      render: (row) => `${formatNumber(row.performance?.reach || 0)} reach`,
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
          <Button
            size="sm"
            variant="secondary"
            disabled={actionId === row.id}
            onClick={() => onDuplicate(row)}
          >
            Duplicate
          </Button>
          {(row.status === 'DRAFT' || row.status === 'REJECTED') && (
            <Button
              size="sm"
              disabled={actionId === row.id}
              onClick={() => void openSend(row)}
            >
              Send to Salesperson
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Sales Scripts"
        description="Generate sales-script words for the salesperson. Model 31 does not create video or auto-publish."
        actions={
          <Button onClick={() => navigate('/marketing/content/create')}>
            <Plus size={16} />
            Create Sales Script
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="md:col-span-2 xl:col-span-1"
          />
          <Select
            value={filters.contentType}
            onChange={(e) => setFilter('contentType', e.target.value)}
            options={[
              { value: 'all', label: 'All content types' },
              ...contentTypes.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={filters.platform}
            onChange={(e) => setFilter('platform', e.target.value)}
            options={[
              { value: 'all', label: 'All platforms' },
              ...platforms.map((t) => ({
                value: t,
                label: t,
              })),
            ]}
          />
          <Select
            value={filters.dealership}
            onChange={(e) => setFilter('dealership', e.target.value)}
            options={[
              { value: 'all', label: 'All dealerships' },
              ...dealerships.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...statuses.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            value={filters.campaign}
            onChange={(e) => setFilter('campaign', e.target.value)}
            options={[
              { value: 'all', label: 'All campaigns' },
              ...campaigns.map((c) => ({ value: c.id, label: c.name })),
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
                columns={actionColumns}
                rows={rows}
                page={page}
                onPageChange={setPage}
                pageSize={PAGE_SIZE}
                totalItems={totalItems}
                showPagination
                emptyTitle="No content found."
                emptyActionLabel="Clear Filters"
                onEmptyAction={clearFilters}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {rows.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onView={() => navigate(`/marketing/content/${item.id}`)}
                  onEdit={() => navigate(`/marketing/content/${item.id}?edit=1`)}
                  onDuplicate={onDuplicate}
                  onSubmit={openSend}
                  onDelete={setDeleteTarget}
                />
              ))}
              {rows.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                  No content found.
                </p>
              )}
              {totalItems > PAGE_SIZE && (
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page * PAGE_SIZE >= totalItems}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
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

      <Modal
        open={Boolean(sendTarget)}
        onClose={() => {
          setSendTarget(null)
          setSendSalespersonId('')
        }}
        title="Send to Salesperson"
      >
        {sendLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size={24} />
          </div>
        ) : sendSalespeople.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            No salespeople found for this dealership.
          </p>
        ) : (
          <Select
            label="Salesperson"
            value={sendSalespersonId}
            onChange={(e) => setSendSalespersonId(e.target.value)}
            placeholder="Select salesperson"
            options={sendSalespeople.map((person) => ({
              value: person.id,
              label: person.label,
            }))}
          />
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setSendTarget(null)
              setSendSalespersonId('')
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={actionId === sendTarget?.id || sendLoading || !sendSalespersonId}
            onClick={() => void onSubmit(sendTarget, sendSalespersonId)}
          >
            Send
          </Button>
        </div>
      </Modal>
    </div>
  )
}
