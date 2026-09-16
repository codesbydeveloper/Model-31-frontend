import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/common/SearchInput'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import negotiationTemplateService from '../../services/api/negotiationTemplateService'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

const EMPTY = {
  name: '',
  description: '',
  vehicleType: 'New',
  minPriceRule: '',
  maxDiscountRule: '',
  paymentRange: '',
  tradeRange: '',
  allowedIncentives: '',
  allowedFees: '',
  status: 'ACTIVE',
}

function visiblePages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export default function NegotiationTemplatesPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openCreate = () => {
    setForm(EMPTY)
    setOpen(true)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await negotiationTemplateService.getNegotiationTemplates({
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
      showToast(err.message || 'Unable to load templates.', 'error')
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

  const duplicateTemplate = async (item) => {
    setBusyId(item.id)
    try {
      await negotiationTemplateService.duplicateNegotiationTemplate(item.id)
      showToast('Template duplicated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to duplicate template.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setBusyId(item.id)
    try {
      await negotiationTemplateService.updateNegotiationTemplateStatus(item.id, nextStatus)
      showToast(item.status === 'ACTIVE' ? 'Template deactivated.' : 'Template activated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update template status.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    setDeleteLoading(true)
    try {
      await negotiationTemplateService.deleteNegotiationTemplate(deleting.id)
      showToast('Template deleted successfully.')
      setDeleting(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete template.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await negotiationTemplateService.createNegotiationTemplate(form)
      setOpen(false)
      showToast('Template created successfully.')
      if (page === 1) await load()
      else setPage(1)
    } catch (err) {
      showToast(err.message || 'Unable to create template.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const from = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + rows.length

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Negotiation Templates"
        description="Reusable manager-defined price, payment and trade rules."
        actions={<Button onClick={openCreate}>Create Template</Button>}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates"
          className="sm:max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : !rows.length ? (
        <Card>
          <EmptyState
            title="No templates found."
            description="Create a reusable price, payment, and trade template."
            actionLabel="Create Template"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)]">Vehicle Count</dt>
                    <dd className="font-medium">{item.vehicleCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Price Rules</dt>
                    <dd className="font-medium">{item.minPriceRule}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Payment Rules</dt>
                    <dd className="font-medium">{item.paymentRange}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Trade Rules</dt>
                    <dd className="font-medium">{item.tradeRange}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--text-muted)]">Last Updated</dt>
                    <dd className="font-medium">{item.lastUpdated}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/super-admin/negotiation-templates/${item.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                  <Link to={`/super-admin/negotiation-templates/${item.id}?edit=1`}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === item.id}
                    onClick={() => duplicateTemplate(item)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === item.id}
                    onClick={() => toggleStatus(item)}
                  >
                    {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === item.id}
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-default)] pt-4 sm:flex-row">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing {from}–{to} of {totalItems}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              {visiblePages(currentPage, totalPages).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title="Create Template"
        className="max-w-2xl"
      >
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={onCreate}>
          <Input
            label="Template Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Vehicle Type"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            options={['New', 'Used', 'Certified Used', 'EV', 'Aged']}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['ACTIVE', 'INACTIVE']}
          />
          <Input
            label="Minimum Price Rule"
            value={form.minPriceRule}
            onChange={(e) => setForm({ ...form, minPriceRule: e.target.value })}
          />
          <Input
            label="Maximum Discount Rule"
            value={form.maxDiscountRule}
            onChange={(e) => setForm({ ...form, maxDiscountRule: e.target.value })}
          />
          <Input
            label="Payment Range"
            value={form.paymentRange}
            onChange={(e) => setForm({ ...form, paymentRange: e.target.value })}
          />
          <Input
            label="Trade Range"
            value={form.tradeRange}
            onChange={(e) => setForm({ ...form, tradeRange: e.target.value })}
          />
          <Input
            label="Allowed Incentives"
            value={form.allowedIncentives}
            onChange={(e) => setForm({ ...form, allowedIncentives: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Allowed Fees"
            value={form.allowedFees}
            onChange={(e) => setForm({ ...form, allowedFees: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Template'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => !deleteLoading && setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete template"
        message={`Are you sure you want to delete ${deleting?.name}?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
