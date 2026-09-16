import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useToast } from '../../hooks/useToast'
import negotiationTemplateService from '../../services/api/negotiationTemplateService'

export default function NegotiationTemplateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItem(await negotiationTemplateService.getNegotiationTemplate(id))
    } catch (err) {
      setItem(null)
      showToast(err.message || 'Unable to load template.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await negotiationTemplateService.deleteNegotiationTemplate(id)
      showToast('Template deleted successfully.')
      navigate('/super-admin/negotiation-templates')
    } catch (err) {
      showToast(err.message || 'Unable to delete template.', 'error')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Template not found</h1>
        <Link to="/super-admin/negotiation-templates" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const update = (key, value) => setItem((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/negotiation-templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.name}
        description={item.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <Button variant="secondary" size="sm" onClick={() => setDeleting(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        }
      />
      <Card>
        <form
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            try {
              const saved = await negotiationTemplateService.updateNegotiationTemplate(id, item)
              setItem(saved)
              showToast('Template saved successfully.')
            } catch (err) {
              showToast(err.message || 'Unable to save template.', 'error')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Input
            label="Template Name"
            value={item.name}
            onChange={(e) => update('name', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Description"
            value={item.description}
            onChange={(e) => update('description', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Select
            label="Vehicle Type"
            value={item.vehicleType}
            onChange={(e) => update('vehicleType', e.target.value)}
            options={['New', 'Used', 'Certified Used', 'EV', 'Aged']}
          />
          <Select
            label="Status"
            value={item.status}
            onChange={(e) => update('status', e.target.value)}
            options={['ACTIVE', 'INACTIVE']}
          />
          <Input
            label="Minimum Price Rule"
            value={item.minPriceRule}
            onChange={(e) => update('minPriceRule', e.target.value)}
          />
          <Input
            label="Maximum Discount Rule"
            value={item.maxDiscountRule}
            onChange={(e) => update('maxDiscountRule', e.target.value)}
          />
          <Input
            label="Payment Range"
            value={item.paymentRange}
            onChange={(e) => update('paymentRange', e.target.value)}
          />
          <Input
            label="Trade Range"
            value={item.tradeRange}
            onChange={(e) => update('tradeRange', e.target.value)}
          />
          <Input
            label="Allowed Incentives"
            value={item.allowedIncentives}
            onChange={(e) => update('allowedIncentives', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Allowed Fees"
            value={item.allowedFees}
            onChange={(e) => update('allowedFees', e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
      <Card className="mt-4">
        <h2 className="text-base font-semibold">Assigned VINs</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Assigned Vehicles: {item.vehicleCount}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {(item.assignedVins || []).map((vin) => (
            <li
              key={vin}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 font-medium"
            >
              {vin}
            </li>
          ))}
        </ul>
      </Card>

      <ConfirmModal
        open={deleting}
        onClose={() => !deleteLoading && setDeleting(false)}
        onConfirm={confirmDelete}
        title="Delete template"
        message={`Are you sure you want to delete ${item.name}?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
