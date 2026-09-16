import { apiRequest } from './http'

function boolValue(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value == null || value === '') return fallback
  const text = String(value).toLowerCase()
  if (text === 'true' || text === 'on' || text === '1') return true
  if (text === 'false' || text === 'off' || text === '0') return false
  return fallback
}

function unwrapRecord(payload) {
  if (!payload || typeof payload !== 'object') return payload
  if (payload.data?.settings && typeof payload.data.settings === 'object') {
    return payload.data.settings
  }
  if (payload.settings && typeof payload.settings === 'object') return payload.settings
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload
}

function mapSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    leadAlerts: boolValue(source.leadAlerts, true),
    crmAutoSync: boolValue(source.crmAutoSync, true),
    appointmentReminders: boolValue(source.appointmentReminders, true),
    afterHoursRouting: boolValue(source.afterHoursRouting, false),
  }
}

export async function getDealershipSettings() {
  const payload = await apiRequest('/api/dealership/settings')
  return mapSettings(unwrapRecord(payload))
}

export async function updateDealershipSettings(settings) {
  const payload = await apiRequest('/api/dealership/settings', {
    method: 'PUT',
    body: mapSettings(settings),
  })
  return mapSettings(unwrapRecord(payload) || settings)
}

const dealershipSettingsService = {
  getDealershipSettings,
  updateDealershipSettings,
}

export default dealershipSettingsService
