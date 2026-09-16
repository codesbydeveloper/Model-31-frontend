import { apiRequest } from './http'
import { extractList, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function lastCheckLabel(value) {
  if (value == null || value === '') return '—'
  const text = String(value)
  if (/just now|never|minute|hour|day|week/i.test(text) && Number.isNaN(Date.parse(text))) {
    return text
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return text
  const diff = Date.now() - date.getTime()
  if (diff >= 0 && diff < 2 * 60 * 1000) return 'Just now'
  return formatStamp(value) || text
}

function latencyMs(raw = {}) {
  const value = raw.latencyMs ?? raw.latency
  if (value == null || value === '' || value === '--' || value === '—') return null
  if (typeof value === 'string' && !/\d/.test(value)) return null
  const num = numberValue(value)
  return Number.isFinite(num) ? num : null
}

export function mapHealthIntegration(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const name = textValue(raw.name || raw.service || raw.integration, `Service ${index + 1}`)
  const status = textValue(raw.status, 'UNKNOWN').toUpperCase()
  const ms = latencyMs(raw)
  return {
    id: raw.id || raw._id || raw.slug || name.toLowerCase().replace(/\s+/g, '_') || `ih_${index + 1}`,
    name,
    status,
    lastCheck: lastCheckLabel(raw.lastCheck || raw.lastCheckedAt || raw.checkedAt),
    latencyMs: status === 'DISCONNECTED' ? null : ms,
    errors: numberValue(raw.errors, raw.errorCount),
  }
}

export function mapHealthPage(payload) {
  const raw = payload && typeof payload === 'object' ? payload : {}
  const summary = raw.summary || {}
  const actions = raw.actions || {}
  return {
    pageTitle: textValue(raw.pageTitle, 'Integration Health'),
    description: textValue(
      raw.description,
      'Monitor the health of platform integrations and supporting services.',
    ),
    lastHealthCheckAt: lastCheckLabel(raw.lastHealthCheckAt || raw.checkedAt),
    summary: {
      total: numberValue(summary.total),
      healthy: numberValue(summary.healthy),
      warning: numberValue(summary.warning),
      error: numberValue(summary.error),
    },
    integrations: extractList(raw, ['integrations', 'items', 'services'])
      .map(mapHealthIntegration)
      .filter(Boolean),
    canRunHealthCheck: actions.canRunHealthCheck !== false,
    message: textValue(raw.message, 'Health check completed.'),
  }
}

export async function getIntegrationHealth() {
  const payload = await apiRequest('/api/super-admin/integration-health')
  return mapHealthPage(payload)
}

export async function runHealthCheck() {
  const payload = await apiRequest('/api/super-admin/integration-health/run-check', {
    method: 'POST',
  })
  return mapHealthPage(payload)
}
