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

function toApiPath(url) {
  const value = textValue(url)
  if (!value) return ''
  if (value.startsWith('/api/')) return value
  try {
    return new URL(value).pathname || value
  } catch {
    return value
  }
}

function missingEnvNames(source) {
  const raw = source.missingEnv ?? source.missing_env ?? []
  const list = Array.isArray(raw) ? raw : String(raw || '').split(',')
  return list
    .map((item) => (typeof item === 'string' ? item.trim() : textValue(item?.name || item?.key || item)))
    .filter(Boolean)
}

export function mapConnectForm(raw, platform) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const configured = source.credentialsConfigured ?? source.credentials_configured
  return {
    title: textValue(source.title) || `Connect ${textValue(platform) || 'account'}`,
    fields: [],
    credentialsConfigured: configured === undefined ? true : configured === true || configured === 'true',
    missingEnv: missingEnvNames(source),
    submitUrl: toApiPath(source.submitUrl || source.submit_url),
  }
}

export function mapSocialAccount(raw) {
  if (!raw || typeof raw !== 'object') return null
  const status = (textValue(raw.status) || 'DISCONNECTED').toUpperCase()
  const connected = status === 'CONNECTED'
  const model31On = sourceOn(raw.model31Source ?? raw.model31_social_source)
  const platform = textValue(raw.platform)
  return {
    id: raw.id || raw._id,
    platform,
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
    connectForm: mapConnectForm(raw.connectForm, platform),
    connectUrl: socialActionUrl(raw, 'connect'),
    disconnectUrl: socialActionUrl(raw, 'disconnect'),
    canConnect: Boolean(raw.canConnect ?? !connected),
    canDisconnect: Boolean(raw.canDisconnect ?? connected),
    canSettings: Boolean(raw.canSettings ?? connected),
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

function extractAccountList(payload) {
  const items = extractList(payload, [
    'accounts',
    'items',
    'socialAccounts',
    'social_accounts',
    'cards',
  ]).filter((item) => item && typeof item === 'object' && !Array.isArray(item))
  if (items.length) return items

  const data = payload?.data ?? payload
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  return Object.values(data).filter((value) => (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && (value.platform || value.id || value._id || value.connectForm)
  ))
}

const DEFAULT_SOCIAL_PLATFORMS = [
  'Facebook',
  'Instagram',
  'WhatsApp',
  'TikTok',
  'YouTube',
  'X',
  'Whatnot',
]

function isBackendSocialId(id) {
  const value = textValue(id)
  if (!value) return false
  return !DEFAULT_SOCIAL_PLATFORMS.some((platform) => platform.toLowerCase() === value.toLowerCase())
}

function socialActionUrl(raw, action) {
  const formUrl = action === 'connect'
    ? raw.connectForm?.submitUrl || raw.submitUrl || raw.connectUrl
    : raw.disconnectUrl
  const fromApi = toApiPath(formUrl)
  if (fromApi) return fromApi
  const id = raw.id || raw._id
  if (!isBackendSocialId(id)) return ''
  return `/api/marketing/social-accounts/${id}/${action}`
}

export async function getSocialAccounts() {
  const payload = await apiRequest('/api/marketing/social-accounts')
  const options = mapOptions(payload.options ?? payload.data?.options)
  const items = extractAccountList(payload)
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map(mapSocialAccount)
    .filter((account) => account && isBackendSocialId(account.id))

  return {
    items,
    options,
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

export async function connectSocialAccount(id, connectUrl) {
  const path = toApiPath(connectUrl) || (isBackendSocialId(id) ? `/api/marketing/social-accounts/${id}/connect` : '')
  if (!path || !/\/social-accounts\/[^/]+\/connect$/i.test(path) || /\/social-accounts\/(facebook|instagram|whatsapp|tiktok|youtube|x|whatnot)\/connect$/i.test(path)) {
    throw new Error('Reload Social Accounts. Connect must use the account id from the server, not the platform name.')
  }
  const payload = await apiRequest(path, {
    method: 'POST',
    body: {},
  })
  return mapSocialAccount(extractItem(payload, ['account', 'item']))
}

export async function disconnectSocialAccount(id, disconnectUrl) {
  const path = toApiPath(disconnectUrl) || `/api/marketing/social-accounts/${id}/disconnect`
  const payload = await apiRequest(path, {
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
