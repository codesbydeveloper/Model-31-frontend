import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import Modal from '../../components/common/Modal'
import ErrorState from '../../components/ui/ErrorState'
import BuyerGenomeCard from '../../components/leads/BuyerGenomeCard'
import BuyOnlineCard from '../../components/leads/BuyOnlineCard'
import VehicleVisualPackageCard from '../../components/leads/VehicleVisualPackageCard'
import StaffDealerFlow from '../../components/leads/StaffDealerFlow'
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import {
  acceptDealHandoff,
  getDealHandoff,
  getDealHandoffVisualPackage,
  markDealHandoffClosed,
  openDealHandoffLead,
  requestDealHandoffInfo,
  takeOverDealHandoff,
} from '../../services/api/superAdminDealHandoffService'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}

function money(value) {
  return `$${formatNumber(value)}`
}

export default function DealHandoffDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [actioning, setActioning] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoNote, setInfoNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setItem(await getDealHandoff(id))
    } catch (err) {
      setItem(null)
      setError(err.status !== 404)
      showToast(err.message || 'Unable to load deal handoff.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const applyAction = async (run, fallbackMessage) => {
    setActioning(true)
    try {
      const result = await run()
      if (result?.handoff) {
        setItem(result.handoff)
      } else {
        setItem(await getDealHandoff(id))
      }
      setConfirm(null)
      setInfoOpen(false)
      showToast(result?.message || fallbackMessage)
    } catch (err) {
      showToast(err.message || 'Unable to complete that action.', 'error')
    } finally {
      setActioning(false)
    }
  }

  const onOpenLead = async () => {
    setActioning(true)
    try {
      const result = await openDealHandoffLead(id)
      if (result.message) showToast(result.message)
      navigate(result.path)
    } catch (err) {
      if (item?.leadId) {
        navigate(`/super-admin/leads/${item.leadId}`)
        return
      }
      showToast(err.message || 'Unable to open lead.', 'error')
    } finally {
      setActioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={load} />
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Handoff not found</h1>
        <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const actionEnabled = (key) =>
    item.actions?.find((action) => action.key === key)?.enabled !== false

  const actionLabel = (key, fallback) =>
    item.actions?.find((action) => action.key === key)?.label || fallback

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/deal-handoffs">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={item.customerName}
        description={`${item.vehicle} · ${item.vin || '—'}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={item.dealStatus} />
            <StatusBadge status={item.priority} />
            <StatusBadge status={item.intent} />
          </div>
        }
      />

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold">Manager Handoff Flow</h2>
        <ol className="space-y-1 text-sm">
          {(item.flowSteps || []).map((step, index, list) => (
            <li key={`${step.step}-${index}`}>
              <p className="font-medium">{step.step}</p>
              {step.detail ? (
                <p className="text-xs text-[var(--text-secondary)]">{step.detail}</p>
              ) : null}
              {index < list.length - 1 && (
                <p className="text-xs text-[var(--text-muted)]">↓</p>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{item.workflowNote}</p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={actioning || !actionEnabled('accept-handoff')}
          onClick={() => setConfirm('accept')}
        >
          {actionLabel('accept-handoff', 'Accept Handoff')}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={actioning || !actionEnabled('request-more-info')}
          onClick={() => {
            setInfoNote('')
            setInfoOpen(true)
          }}
        >
          {actionLabel('request-more-info', 'Request More Information')}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={actioning || !actionEnabled('take-over')}
          onClick={() => setConfirm('takeover')}
        >
          {actionLabel('take-over', 'Take Over')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={actioning || !actionEnabled('mark-closed')}
          onClick={() => setConfirm('close')}
        >
          {actionLabel('mark-closed', 'Mark Closed')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={actioning || !actionEnabled('open-lead')}
          onClick={onOpenLead}
        >
          {actionLabel('open-lead', 'Open Lead')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Deal Details</h2>
          <dl className="space-y-2">
            <Row label="Customer" value={item.customerName} />
            <Row label="Vehicle" value={item.vehicle} />
            <Row label="VIN" value={item.vin} />
            <Row label="Lead Score" value={item.score} />
            <Row label="Budget" value={item.budget} />
            <Row label="Payment Preference" value={item.paymentPreference} />
            <Row label="Trade Information" value={item.trade} />
            <Row label="Appointment" value={item.appointment} />
            <Row label="Salesperson" value={item.salesperson} />
            <Row label="Deal Status" value={item.dealStatus} />
          </dl>
          {item.conversationSummary ? (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              {item.conversationSummary}
            </p>
          ) : null}
        </Card>
        <BuyerGenomeCard genome={item.genome} />
        <Card>
          <h2 className="mb-3 text-base font-semibold">Negotiation Limits</h2>
          {item.limits ? (
            <dl className="space-y-2">
              <Row label="Minimum Price" value={money(item.limits.minPrice)} />
              <Row label="Maximum Discount" value={money(item.limits.maxDiscount)} />
              <Row
                label="Payment"
                value={`${money(item.limits.paymentMin)}–${money(item.limits.paymentMax)}`}
              />
              <Row
                label="Trade"
                value={`${money(item.limits.tradeMin)}–${money(item.limits.tradeMax)}`}
              />
              <Row label="Template" value={item.limits.template} />
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              If negotiation limits are not configured, price negotiation is unavailable.
            </p>
          )}
        </Card>
        <BuyOnlineCard
          nuclearOn={item.buyOnline.nuclearOn}
          intent={item.intent}
          dealStatus={item.dealStatus}
          vehicle={item.buyOnline.vehicle}
          available={item.buyOnline.available}
        />
        {(item.visualPackage) ? (
          <VehicleVisualPackageCard
            pack={item.visualPackage}
            description="Vehicle media for this deal."
            loadPackage={() => getDealHandoffVisualPackage(id)}
          />
        ) : null}
        {item.staffSocial ? (
          <StaffDealerFlow
            showTransfer={item.dealStatus === 'DEAL READY'}
            title={item.staffFlow?.title}
            source={item.staffFlow?.source}
            status={item.staffFlow?.status}
            steps={(item.staffFlow?.steps || []).map((step) =>
              typeof step === 'string' ? step : step.step,
            )}
          />
        ) : null}
      </div>

      <ConfirmModal
        open={confirm === 'accept'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyAction(() => acceptDealHandoff(id), 'Handoff accepted.')}
        title="Accept handoff?"
        message="This marks the deal as manager accepted. It does not close the sale."
        confirmLabel="Accept Handoff"
        loading={actioning}
      />
      <ConfirmModal
        open={confirm === 'takeover'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyAction(() => takeOverDealHandoff(id), 'Manager takeover recorded.')}
        title="Take over this deal?"
        message="You will take over this handoff from the current salesperson."
        confirmLabel="Take Over"
        loading={actioning}
      />
      <ConfirmModal
        open={confirm === 'close'}
        onClose={() => setConfirm(null)}
        onConfirm={() =>
          applyAction(() => markDealHandoffClosed(id), 'Marked closed by manager.')
        }
        title="Mark closed?"
        message="Model 31 will not automatically mark this deal as sold."
        confirmLabel="Mark Closed"
        loading={actioning}
      />

      <Modal
        open={infoOpen}
        onClose={() => !actioning && setInfoOpen(false)}
        title="Request more information"
      >
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          The deal will remain in manager review.
        </p>
        <Input
          label="Note"
          value={infoNote}
          onChange={(e) => setInfoNote(e.target.value)}
          placeholder="Add a note..."
        />
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setInfoOpen(false)} disabled={actioning}>
            Cancel
          </Button>
          <Button
            disabled={actioning || !infoNote.trim()}
            onClick={() =>
              applyAction(
                () => requestDealHandoffInfo(id, infoNote.trim()),
                'More information requested.',
              )
            }
          >
            {actioning ? <LoadingSpinner size={16} /> : 'Request Info'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
