import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import Modal from '../common/Modal'

export default function VehicleVisualPackageCard({ pack }) {
  const [open, setOpen] = useState(false)
  if (!pack) return null

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Vehicle Visual Package</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Mock media placeholders. No VIN/media APIs.
          </p>
        </div>
        <StatusBadge status={pack.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[var(--text-muted)]">Exterior</dt>
          <dd className="font-medium">{pack.exterior}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Interior</dt>
          <dd className="font-medium">{pack.interior}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Color</dt>
          <dd className="font-medium">{pack.color}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Trim</dt>
          <dd className="font-medium">{pack.trim}</dd>
        </div>
      </dl>
      <Button className="mt-4" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        View Package
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Vehicle Visual Package" className="max-w-2xl">
        <p className="mb-3 text-sm text-[var(--text-secondary)]">{pack.vehicle}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(pack.images.length ? pack.images : ['No images']).map((label) => (
            <div
              key={label}
              className="flex aspect-video items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-center text-xs font-medium text-[var(--text-secondary)]"
            >
              {label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          <span className="text-[var(--text-muted)]">Vehicle Video: </span>
          {pack.video}
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
