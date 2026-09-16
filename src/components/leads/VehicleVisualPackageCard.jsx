import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'

function asImageItems(images = []) {
  return (Array.isArray(images) ? images : []).map((item, index) => {
    if (typeof item === 'string') return { id: `${item}-${index}`, label: item, url: '' }
    return {
      id: item.id || item.label || `img_${index}`,
      label: item.label || `Image ${index + 1}`,
      url: item.url || '',
    }
  })
}

export default function VehicleVisualPackageCard({
  pack,
  loadPackage,
  description = 'Vehicle photos and media for this lead.',
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  if (!pack) return null

  const display = detail || pack
  const images = asImageItems(display.images)

  const openModal = async () => {
    setOpen(true)
    if (!loadPackage || detail) return
    setLoading(true)
    setError('')
    try {
      setDetail(await loadPackage())
    } catch (err) {
      setError(err.message || 'Unable to load visual package.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Vehicle Visual Package</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <StatusBadge status={pack.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[var(--text-muted)]">Exterior</dt>
          <dd className="font-medium">{pack.exterior || '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Interior</dt>
          <dd className="font-medium">{pack.interior || '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Color</dt>
          <dd className="font-medium">{pack.color || '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Trim</dt>
          <dd className="font-medium">{pack.trim || '—'}</dd>
        </div>
      </dl>
      <Button className="mt-4" size="sm" variant="secondary" onClick={openModal}>
        View Package
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Vehicle Visual Package" className="max-w-2xl">
        <p className="mb-3 text-sm text-[var(--text-secondary)]">{display.vehicle}</p>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={24} />
          </div>
        ) : error ? (
          <p className="text-sm text-[var(--status-error)]">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(images.length ? images : [{ id: 'empty', label: 'No images', url: '' }]).map(
                (image) => (
                  <div
                    key={image.id}
                    className="flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-center text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      image.label
                    )}
                  </div>
                ),
              )}
            </div>
            {display.video ? (
              <p className="mt-3 text-sm">
                <span className="text-[var(--text-muted)]">Vehicle Video: </span>
                {display.video}
              </p>
            ) : null}
          </>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
