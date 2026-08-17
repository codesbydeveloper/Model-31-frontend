import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import BuyerGenomeCard from '../../components/leads/BuyerGenomeCard'
import BuyOnlineCard from '../../components/leads/BuyOnlineCard'
import VehicleVisualPackageCard from '../../components/leads/VehicleVisualPackageCard'
import StaffDealerFlow from '../../components/leads/StaffDealerFlow'
import { useToast } from '../../hooks/useToast'
import dealHandoffService from '../../services/mock/dealHandoffService'
import buyerGenomeService from '../../services/mock/buyerGenomeService'
import visualPackageService from '../../services/mock/visualPackageService'
import nuclearModeService from '../../services/mock/nuclearModeService'
import negotiationService from '../../services/mock/negotiationService'
import { handoffWorkflow } from '../../data/dealHandoffs'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}

export default function DealHandoffDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [item, setItem] = useState(null)
  const [genome, setGenome] = useState(null)
  const [pack, setPack] = useState(null)
  const [nuclear, setNuclear] = useState(null)
  const [limit, setLimit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const handoff = await dealHandoffService.getDealHandoff(id)
      setItem(handoff)
      if (handoff) {
        const [g, v, n, limits] = await Promise.all([
          buyerGenomeService.getBuyerGenome(handoff.leadId),
          visualPackageService.getVehicleVisualPackage(handoff.leadId),
          nuclearModeService.getNuclearMode(),
          negotiationService.getNegotiationLimits(),
        ])
        setGenome(g)
        setPack(v)
        setNuclear(n)
        setLimit(limits.find((row) => row.vin === handoff.vin) || null)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const applyStatus = async (dealStatus, message) => {
    const updated = await dealHandoffService.updateDealHandoff(id, { dealStatus })
    setItem(updated)
    setConfirm(null)
    showToast(message)
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
        <h1 className="text-xl font-semibold">Handoff not found</h1>
        <Link to="/super-admin/deal-handoffs" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const nuclearOn = Boolean(nuclear?.enabled)

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
        description={`${item.vehicle} · ${item.vin}`}
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
          {handoffWorkflow.map((step, index) => (
            <li key={step}>
              <p className="font-medium">{step}</p>
              {index < handoffWorkflow.length - 1 && (
                <p className="text-xs text-[var(--text-muted)]">↓</p>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Model 31 does not automatically mark a deal as sold.
        </p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setConfirm('accept')}>
          Accept Handoff
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setConfirm('info')}>
          Request More Information
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setConfirm('takeover')}>
          Take Over
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirm('close')}>
          Mark Closed
        </Button>
        <Link to={`/super-admin/leads/${item.leadId}`}>
          <Button size="sm" variant="ghost">
            Open Lead
          </Button>
        </Link>
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
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {item.conversationSummary}
          </p>
        </Card>
        <BuyerGenomeCard genome={genome} />
        <Card>
          <h2 className="mb-3 text-base font-semibold">Negotiation Limits</h2>
          {limit ? (
            <dl className="space-y-2">
              <Row label="Minimum Price" value={`$${limit.minPrice.toLocaleString()}`} />
              <Row label="Maximum Discount" value={`$${limit.maxDiscount.toLocaleString()}`} />
              <Row label="Payment" value={`$${limit.paymentMin}–$${limit.paymentMax}`} />
              <Row label="Trade" value={`$${limit.tradeMin.toLocaleString()}–$${limit.tradeMax.toLocaleString()}`} />
              <Row label="Template" value={limit.template} />
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              If negotiation limits are not configured, price negotiation is unavailable.
            </p>
          )}
        </Card>
        <BuyOnlineCard
          nuclearOn={nuclearOn}
          intent={item.intent}
          dealStatus={item.dealStatus}
          vehicle={item.vehicle}
        />
        {item.intent === 'HIGH' && <VehicleVisualPackageCard pack={pack} />}
        {item.staffSocial && (
          <StaffDealerFlow showTransfer={item.dealStatus === 'DEAL READY'} />
        )}
      </div>

      <ConfirmModal
        open={confirm === 'accept'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyStatus('MANAGER ACCEPTED', 'Handoff accepted (mock).')}
        title="Accept handoff?"
        message="This mock action marks the deal as manager accepted. It does not close the sale."
        confirmLabel="Accept Handoff"
      />
      <ConfirmModal
        open={confirm === 'info'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyStatus('MANAGER REVIEW', 'More information requested (mock).')}
        title="Request more information?"
        message="The deal will remain in manager review."
        confirmLabel="Request Info"
      />
      <ConfirmModal
        open={confirm === 'takeover'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyStatus('MANAGER ACCEPTED', 'Manager takeover recorded (mock).')}
        title="Take over this deal?"
        message="This is a mock takeover. No live messaging is sent."
        confirmLabel="Take Over"
      />
      <ConfirmModal
        open={confirm === 'close'}
        onClose={() => setConfirm(null)}
        onConfirm={() => applyStatus('CLOSED', 'Marked closed by manager. Not auto-sold.')}
        title="Mark closed?"
        message="Model 31 will not automatically mark this deal as sold."
        confirmLabel="Mark Closed"
      />
    </div>
  )
}
