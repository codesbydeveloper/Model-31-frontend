import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import Modal from '../common/Modal'

export default function BuyOnlineCard({
  nuclearOn,
  intent,
  dealStatus,
  vehicle,
}) {
  const [open, setOpen] = useState(false)
  const [continued, setContinued] = useState(false)
  const enabled =
    nuclearOn && intent === 'HIGH' && dealStatus === 'DEAL READY'

  return (
    <Card>
      <h2 className="text-base font-semibold">Buy Online</h2>
      {enabled ? (
        <>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Conditions met. This is a mock confirmation only — no checkout.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Buy Online
          </Button>
        </>
      ) : (
        <p
          className="mt-2 text-sm text-[var(--text-secondary)]"
          title="Buy Online becomes available when the required deal conditions are met."
        >
          Buy Online unavailable
        </p>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Ready to Buy Online?">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-secondary)]">Vehicle</dt>
            <dd className="font-medium">{vehicle || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--text-secondary)]">Deal Status</dt>
            <dd>
              <StatusBadge status="Ready" />
            </dd>
          </div>
        </dl>
        {continued ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Mock navigation complete. Checkout is not implemented.
          </p>
        ) : (
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setContinued(true)
              }}
            >
              Continue
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  )
}
