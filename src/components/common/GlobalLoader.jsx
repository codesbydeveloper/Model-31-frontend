import { useEffect, useState, useSyncExternalStore } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { getLoadingCount, subscribeLoading } from '../../context/loadingStore'

const SHOW_DELAY_MS = 150

export default function GlobalLoader() {
  const pending = useSyncExternalStore(subscribeLoading, getLoadingCount, () => 0) > 0
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!pending) {
      setVisible(false)
      return undefined
    }
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [pending])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(15,28,42,0.4)]"
      role="alert"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex min-w-40 flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] px-8 py-6 shadow-[var(--shadow-lg)]">
        <LoadingSpinner size={32} />
        <p className="text-sm font-medium text-[var(--text-primary)]">Please wait...</p>
      </div>
    </div>
  )
}
