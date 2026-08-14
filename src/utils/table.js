export function statusVariant(status = '') {
  const value = String(status).toLowerCase()
  if (
    [
      'active',
      'connected',
      'on',
      'ready',
      'healthy',
      'qualified',
      'closed',
      'online',
      'a',
      'tier a',
      'accepted',
      'on time',
      'high',
      'sold',
      'resolved',
      'assigned',
      'confirmed',
      'completed',
      'paid',
      'approved',
      'published',
      'healthy',
      'processed',
      'available',
      'success',
      'info',
      'merged',
      'retried',
    ].includes(value)
  ) {
    return 'ready'
  }
  if (
    [
      'inactive',
      'partial',
      'pending',
      'pending approval',
      'qualifying',
      'routed',
      'suspended',
      'busy',
      'new',
      'b',
      'tier b',
      'medium',
      'warning',
      'waiting',
      'contacted',
      'appointment',
      'open',
      'offered',
      'scheduled',
      'paused',
      'syncing',
      'reserved',
    ].includes(value)
  ) {
    return 'pending'
  }
  if (
    [
      'disconnected',
      'error',
      'disabled',
      'failed',
      'offline',
      'c',
      'tier c',
      'low',
      'breached',
      'expired',
      'declined',
      'not sold',
      'escalated',
      'no show',
      'cancelled',
      'rejected',
      'critical',
    ].includes(value)
  ) {
    return 'error'
  }
  return 'neutral'
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

export function formatPercent(value) {
  const num = Number(value || 0)
  return `${num.toFixed(2)}%`
}

export function formatCurrencyRange(min, max) {
  const fmt = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
  return `${fmt(min)} – ${fmt(max)}`
}

export function sortBy(rows, key, dir = 'asc') {
  const sorted = [...rows].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'number' && typeof bv === 'number') {
      return av - bv
    }
    return String(av ?? '').localeCompare(String(bv ?? ''), undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  })
  return dir === 'asc' ? sorted : sorted.reverse()
}
