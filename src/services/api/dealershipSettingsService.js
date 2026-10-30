import { ApiError, apiRequest } from './http'

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

function textValue(value) {
  if (value == null) return ''
  return String(value).trim()
}

function smsRecord(payload) {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload && typeof payload === 'object' ? payload : {}
}

function mapSmsAccount(raw) {
  const source = smsRecord(raw)
  const hasAuthToken = Boolean(source.hasAuthToken || source.has_auth_token || source.connected)
  return {
    providerType: textValue(source.providerType || source.provider_type) || 'Twilio',
    accountSid: textValue(source.accountSid || source.account_sid || source.twilio_account_sid),
    phoneNumber: textValue(source.phoneNumber || source.phone_number || source.twilio_phone_number),
    timezone: textValue(source.timezone || source.dealership_timezone) || 'America/New_York',
    carrierProfileId: textValue(source.carrierProfileId || source.carrier_profile_id),
    hasAuthToken,
    connected: Boolean(source.connected || hasAuthToken),
  }
}

function isMissingSmsAccount(err) {
  if (!(err instanceof ApiError)) return false
  if (err.status === 404) return true
  return String(err.message || '').toLowerCase().includes('not connected')
}

export async function getDealershipSmsAccount() {
  try {
    const payload = await apiRequest('/api/dealership/sms-account')
    return mapSmsAccount(payload)
  } catch (err) {
    if (isMissingSmsAccount(err)) return null
    throw err
  }
}

export async function updateDealershipSmsAccount(form) {
  const body = {
    providerType: form.providerType,
    accountSid: textValue(form.accountSid),
    phoneNumber: textValue(form.phoneNumber),
    timezone: form.timezone,
    carrierProfileId: textValue(form.carrierProfileId) || null,
  }
  const authToken = textValue(form.authToken)
  if (authToken) body.authToken = authToken

  const payload = await apiRequest('/api/dealership/sms-account', {
    method: 'PUT',
    body,
  })
  return mapSmsAccount(payload)
}

const dealershipSettingsService = {
  getDealershipSettings,
  updateDealershipSettings,
  getDealershipSmsAccount,
  updateDealershipSmsAccount,
}

export default dealershipSettingsService
