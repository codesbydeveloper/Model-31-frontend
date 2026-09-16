import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function boolValue(value, fallback = false) {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', 'on', '1'].includes(normalized)) return true
    if (['false', 'off', '0'].includes(normalized)) return false
  }
  return fallback
}

function optionList(raw, key, fallback = []) {
  const items = extractList(raw, [key]).map((item) => textValue(item)).filter(Boolean)
  return items.length ? items : fallback
}

export function mapCrmBanner(raw = {}) {
  return {
    crmMode: textValue(raw.crmMode || raw.mode, 'READ ONLY'),
    pipeline: textValue(raw.pipeline, 'DEALERSHIP'),
    source: textValue(raw.source, 'CRM'),
    model31Access: textValue(raw.model31Access || raw.access, 'READ ONLY'),
    note: textValue(raw.note, 'Model 31 does not modify dealership leads.'),
  }
}

export function mapCrmIntegration(raw) {
  if (!raw || typeof raw !== 'object') return null
  const health = raw.health || {}
  return {
    id: raw.id || raw._id,
    name: textValue(raw.name || raw.crmName || raw.provider),
    status: textValue(raw.status, 'DISCONNECTED'),
    environment: textValue(raw.environment, 'Production'),
    connectedDate: textValue(raw.connectedDate || formatStamp(raw.connectedAt)),
    lastSync: textValue(raw.lastSync, formatStamp(raw.lastSyncedAt) || '—'),
    nextSync: textValue(raw.nextSync, '—'),
    recordsSynced: numberValue(raw.recordsSynced, raw.records),
    syncErrors: numberValue(raw.syncErrors, raw.errors),
    syncFrequency: textValue(raw.syncFrequency, 'Every 15 minutes'),
    timezone: textValue(raw.timezone, 'America/New_York'),
    autoSync: boolValue(raw.autoSync, true),
    leadSync: boolValue(raw.leadSync, true),
    customerSync: boolValue(raw.customerSync, true),
    appointmentSync: boolValue(raw.appointmentSync, true),
    soldDealSync: boolValue(raw.soldDealSync, true),
    health: {
      latencyMs: numberValue(health.latencyMs, health.latency),
      uptime: numberValue(health.uptime),
      lastCheck: textValue(health.lastCheck, formatStamp(health.checkedAt) || '—'),
    },
  }
}

function mapSyncError(row, index = 0) {
  return {
    id: row.id || row._id || `err_${index + 1}`,
    crmId: row.crmId || row.integrationId,
    record: textValue(row.record || row.recordId),
    type: textValue(row.type),
    message: textValue(row.message || row.error),
    created: textValue(row.created, formatStamp(row.createdAt) || '—'),
    status: textValue(row.status, 'FAILED'),
  }
}

function mapActivity(row, index = 0) {
  return {
    id: row.id || row._id || `cact_${index}`,
    event: textValue(row.event || row.message || row.type, 'CRM event'),
    crm: textValue(row.crm || row.crmName),
    time: textValue(row.time, formatStamp(row.createdAt) || '—'),
    status: textValue(row.status, 'SUCCESS'),
  }
}

function mapFieldMapping(row, index = 0) {
  return {
    id: row.id || `map_${index}`,
    source: textValue(row.source || row.model31Field || row.from),
    target: textValue(row.target || row.crmField || row.to),
    status: textValue(row.status, 'Mapped'),
  }
}

export async function getCrmIntegrationsOverview() {
  const payload = await apiRequest('/api/super-admin/crm-integrations')
  const metrics = payload.metrics || payload.summary || {}
  return {
    banner: mapCrmBanner(payload.banner || {}),
    metrics: {
      connectedCrms: numberValue(metrics.connectedCrms),
      activeSyncs: numberValue(metrics.activeSyncs),
      recordsSyncedToday: numberValue(metrics.recordsSyncedToday),
      syncErrors: numberValue(metrics.syncErrors),
      lastSuccessfulSync: textValue(metrics.lastSuccessfulSync, '—'),
    },
    items: extractList(payload, ['integrations', 'items']).map(mapCrmIntegration).filter(Boolean),
  }
}

export async function getCrmSyncErrors() {
  const payload = await apiRequest('/api/super-admin/crm-integrations/sync-errors')
  const items = extractList(payload, ['errors', 'items']).map(mapSyncError)
  return {
    items,
    ...extractPagination(payload, { page: 1, limit: items.length || 6, itemCount: items.length }),
  }
}

export async function retryCrmSyncError(errorId) {
  const payload = await apiRequest(
    `/api/super-admin/crm-integrations/sync-errors/${errorId}/retry`,
    { method: 'POST' },
  )
  return mapSyncError(extractItem(payload, ['error', 'item']) || payload)
}

export async function getCrmActivity() {
  const payload = await apiRequest('/api/super-admin/crm-integrations/activity')
  return extractList(payload, ['activity', 'items']).map(mapActivity)
}

export async function getCrmIntegration(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}`)
  return mapCrmIntegration(extractItem(payload, ['integration', 'crm', 'item']) || payload)
}

export async function syncCrmNow(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/sync-now`, {
    method: 'POST',
  })
  return mapCrmIntegration(extractItem(payload, ['integration', 'crm', 'item']) || payload) || true
}

export async function getCrmSettings(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/settings`)
  const raw = extractItem(payload, ['settings', 'integration']) || payload
  const options = raw.options || payload.options || {}
  return {
    environment: textValue(raw.environment, 'Production'),
    syncFrequency: textValue(raw.syncFrequency, 'Every 15 minutes'),
    timezone: textValue(raw.timezone, 'America/New_York'),
    autoSync: boolValue(raw.autoSync, true),
    leadSync: boolValue(raw.leadSync, true),
    customerSync: boolValue(raw.customerSync, true),
    appointmentSync: boolValue(raw.appointmentSync, true),
    soldDealSync: boolValue(raw.soldDealSync, true),
    options: {
      environments: optionList(options, 'environments', ['Production', 'Sandbox']),
      frequencies: optionList(options, 'frequencies', ['Every 15 minutes', 'Hourly', 'Daily']),
      timezones: optionList(options, 'timezones', [
        'America/New_York',
        'America/Chicago',
        'America/Los_Angeles',
      ]),
    },
  }
}

export async function saveCrmSettings(id, form) {
  await apiRequest(`/api/super-admin/crm-integrations/${id}/settings`, {
    method: 'PUT',
    body: {
      environment: form.environment,
      syncFrequency: form.syncFrequency,
      timezone: form.timezone,
      autoSync: Boolean(form.autoSync),
      leadSync: Boolean(form.leadSync),
      customerSync: Boolean(form.customerSync),
      appointmentSync: Boolean(form.appointmentSync),
      soldDealSync: Boolean(form.soldDealSync),
    },
  })
  try {
    return await getCrmSettings(id)
  } catch {
    return {
      environment: form.environment,
      syncFrequency: form.syncFrequency,
      timezone: form.timezone,
      autoSync: Boolean(form.autoSync),
      leadSync: Boolean(form.leadSync),
      customerSync: Boolean(form.customerSync),
      appointmentSync: Boolean(form.appointmentSync),
      soldDealSync: Boolean(form.soldDealSync),
      options: form.options,
    }
  }
}

export async function disconnectCrm(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/disconnect`, {
    method: 'POST',
  })
  return mapCrmIntegration(extractItem(payload, ['integration', 'crm', 'item']) || payload) || true
}

export async function getCrmSynchronization(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/synchronization`)
  const items = extractList(payload, ['errors', 'items', 'rows']).map(mapSyncError)
  return {
    items,
    ...extractPagination(payload, { page: 1, limit: items.length || 8, itemCount: items.length }),
  }
}

export async function getCrmFieldMapping(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/field-mapping`)
  return extractList(payload, ['mappings', 'items', 'fieldMapping']).map(mapFieldMapping)
}

export async function getCrmIntegrationActivity(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/activity`)
  return extractList(payload, ['activity', 'items']).map(mapActivity)
}

export async function getCrmHealth(id) {
  const payload = await apiRequest(`/api/super-admin/crm-integrations/${id}/health`)
  const raw = extractItem(payload, ['health']) || payload
  return {
    latencyMs: numberValue(raw.latencyMs, raw.latency),
    uptime: numberValue(raw.uptime),
    lastCheck: textValue(raw.lastCheck, formatStamp(raw.checkedAt) || '—'),
  }
}

const superAdminCrmService = {
  getCrmIntegrationsOverview,
  getCrmSyncErrors,
  retryCrmSyncError,
  getCrmActivity,
  getCrmIntegration,
  syncCrmNow,
  getCrmSettings,
  saveCrmSettings,
  disconnectCrm,
  getCrmSynchronization,
  getCrmFieldMapping,
  getCrmIntegrationActivity,
  getCrmHealth,
}

export default superAdminCrmService
