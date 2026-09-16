import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  textValue,
} from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatLastSync(value) {
  if (!value) return '—'
  if (String(value).toLowerCase() === 'just now') return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const diffMs = Date.now() - date.getTime()
  if (diffMs >= 0 && diffMs < 2 * 60 * 1000) return 'Just now'
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function sourceOn(value) {
  if (typeof value === 'boolean') return value
  const text = String(value || '').toUpperCase()
  return text === 'ON' || text === 'TRUE' || text === '1'
}

export function mapSocialAccount(raw) {
  if (!raw || typeof raw !== 'object') return null
  const status = textValue(raw.status) || 'DISCONNECTED'
  const model31On = sourceOn(raw.model31Source ?? raw.model31_social_source)
  return {
    id: raw.id || raw._id,
    platform: textValue(raw.platform),
    accountName: textValue(raw.accountName),
    owner: textValue(raw.ownerName || raw.owner),
    ownerType: textValue(raw.ownerType),
    status,
    model31Source: model31On ? 'ON' : 'OFF',
    model31_social_source: model31On,
    lastSync: formatLastSync(raw.lastSync),
    posts: numberValue(raw.posts),
    followers: numberValue(raw.followers),
    reach: numberValue(raw.reach),
    leads: numberValue(raw.leads),
    engagement: numberValue(raw.engagement),
    postingEnabled: Boolean(raw.postingEnabled),
    autoPublishing: Boolean(raw.autoPublishing),
    defaultContentType: textValue(raw.defaultContentType) || 'Social Post',
    defaultLanguage: textValue(raw.defaultLanguage) || 'English',
    defaultTimezone: textValue(raw.defaultTimezone) || 'America/New_York',
    environment: textValue(raw.environment) || 'Production',
    canConnect: Boolean(raw.canConnect ?? status !== 'CONNECTED'),
    canDisconnect: Boolean(raw.canDisconnect ?? status === 'CONNECTED'),
    canSettings: Boolean(raw.canSettings ?? status === 'CONNECTED'),
  }
}

function mapOptions(raw = {}) {
  return {
    platforms: extractList(raw, ['platforms']).map((item) => textValue(item)).filter(Boolean),
    environments: extractList(raw, ['environments']).map((item) => textValue(item)).filter(Boolean),
    contentTypes: extractList(raw, ['contentTypes']).map((item) => textValue(item)).filter(Boolean),
    languages: extractList(raw, ['languages']).map((item) => textValue(item)).filter(Boolean),
    timezones: extractList(raw, ['timezones']).map((item) => textValue(item)).filter(Boolean),
  }
}

export function settingsPayload(form) {
  return {
    accountName: String(form.accountName || '').trim(),
    model31Source: form.model31Source === true || form.model31Source === 'ON' ? 'ON' : 'OFF',
    postingEnabled: Boolean(form.postingEnabled),
    autoPublishing: Boolean(form.autoPublishing),
    defaultContentType: form.defaultContentType,
    defaultLanguage: form.defaultLanguage,
    defaultTimezone: form.defaultTimezone,
  }
}

export async function getSocialAccounts() {
  const payload = await apiRequest('/api/marketing/social-accounts')
  const items = extractList(payload, ['accounts', 'items'])
    .map(mapSocialAccount)
    .filter(Boolean)
  return {
    items,
    options: mapOptions(payload.options),
  }
}

export async function getSocialAccount(id) {
  const payload = await apiRequest(`/api/marketing/social-accounts/${id}`)
  return {
    account: mapSocialAccount(extractItem(payload, ['account', 'item'])),
    options: mapOptions(payload.options),
  }
}

export async function updateSocialSettings(id, form) {
  const payload = await apiRequest(`/api/marketing/social-accounts/${id}/settings`, {
    method: 'PUT',
    body: settingsPayload(form),
  })
  return mapSocialAccount(extractItem(payload, ['account', 'item']))
}

export async function connectSocialAccount(id, form) {
  const payload = await apiRequest(`/api/marketing/social-accounts/${id}/connect`, {
    method: 'POST',
    body: {
      platform: form.platform,
      accountName: String(form.accountName || '').trim(),
      environment: form.environment || 'Production',
    },
  })
  return mapSocialAccount(extractItem(payload, ['account', 'item']))
}

export async function disconnectSocialAccount(id) {
  const payload = await apiRequest(`/api/marketing/social-accounts/${id}/disconnect`, {
    method: 'POST',
  })
  return mapSocialAccount(extractItem(payload, ['account', 'item']))
}

const marketingSocialService = {
  getSocialAccounts,
  getSocialAccount,
  updateSocialSettings,
  connectSocialAccount,
  disconnectSocialAccount,
}

export default marketingSocialService
