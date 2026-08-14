import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import dispatchService from '../../services/mock/dispatchService'
import salespersonService from '../../services/mock/salespersonService'

function formatCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function IncomingLeadsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(299)
  const [busy, setBusy] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [expired, setExpired] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await dispatchService.getIncomingOffers('sp_001')
      setOffers(rows)
      setSecondsLeft(rows[0]?.expiresIn ?? 299)
      setExpired(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const current = offers[0]

  useEffect(() => {
    if (!current || expired || busy) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [current, expired, busy])

  useEffect(() => {
    if (secondsLeft !== 0 || !current || expired) return
    ;(async () => {
      setExpired(true)
      await dispatchService.expireOffer(current.id)
      showToast('Lead offer expired.', 'error')
      await load()
    })()
  }, [secondsLeft, current, expired, showToast, load])

  const accept = async () => {
    if (!current) return
    setBusy(true)
    try {
      await dispatchService.acceptOffer(current.id)
      await salespersonService.acceptIncomingLead(current.id, current)
      showToast('Lead accepted.')
      navigate(`/salesperson/leads/${current.id}`)
    } finally {
      setBusy(false)
    }
  }

  const decline = async () => {
    if (!current) return
    setBusy(true)
    try {
      await dispatchService.declineOffer(current.id)
      await salespersonService.declineIncomingLead(current.id)
      showToast('Lead declined and sent to the next available salesperson.')
      setDeclineOpen(false)
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!current) {
    return (
      <div className="mx-auto w-full max-w-lg pb-20 md:pb-0">
        <Breadcrumbs />
        <PageHeader
          title="Incoming Leads"
          description="New qualified lead dispatch offers appear here."
        />
        <Card>
          <EmptyState
            title="No incoming leads"
            description="Go online and wait for the next dispatch offer."
            actionLabel="Back to Dashboard"
            onAction={() => navigate('/salesperson/dashboard')}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Incoming Leads"
        description="Accept or decline dispatched qualified leads."
      />

      <Card className="overflow-hidden !p-0">
        <div className="bg-[var(--brand-primary)] px-5 py-4 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">
            New Qualified Lead
          </p>
          <p className="mt-3 text-4xl font-semibold tabular-nums">
            {formatCountdown(secondsLeft)}
          </p>
          <p className="mt-1 text-sm text-white/80">Time remaining</p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              {current.customerName}
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="rounded-full bg-[var(--brand-accent-soft)] px-3 py-1 text-lg font-semibold text-[var(--brand-accent)]">
                {current.score}
              </span>
              <StatusBadge status={`Tier ${current.tier}`} />
            </div>
          </div>

          <dl className="space-y-2 text-sm">
            <Row label="Vehicle" value={current.vehicle} />
            <Row label="Budget" value={current.budget} />
            <Row label="Timeline" value={current.timeline} />
            <Row label="Location" value={current.location} />
            <Row label="Financing" value={current.financing} />
            <Row label="Dealership" value={current.dealership} />
          </dl>

          {expired || secondsLeft === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--status-error)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error)]">
              Lead offer expired. Lead sent to next available salesperson.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <Button
                className="min-h-14 w-full text-base font-semibold"
                onClick={accept}
                disabled={busy}
              >
                {busy ? <LoadingSpinner size={18} /> : 'ACCEPT LEAD'}
              </Button>
              <Button
                variant="secondary"
                className="min-h-12 w-full text-base"
                onClick={() => setDeclineOpen(true)}
                disabled={busy}
              >
                DECLINE
              </Button>
            </div>
          )}
        </div>
      </Card>

      <ConfirmModal
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        onConfirm={decline}
        title="Decline lead?"
        message="Are you sure you want to decline this lead?"
        confirmLabel="Decline Lead"
        danger
        loading={busy}
      />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] py-2 last:border-0">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-medium text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}
