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

function mapConnectField(raw) {
  if (!raw) return null
  if (typeof raw === 'string') {
    return { name: raw, label: raw, required: false, type: 'text', placeholder: '', help: '' }
  }
  if (typeof raw !== 'object') return null
  const name = textValue(raw.name || raw.key || raw.id || raw.field)
  if (!name) return null
  const label = textValue(raw.label) || name
  const rawType = String(raw.type || 'text').toLowerCase()
  const looksSecret = rawType === 'password' || rawType === 'secret' || /secret/i.test(name) || /secret/i.test(label)
  const type = looksSecret
    ? 'password'
    : rawType === 'textarea' || rawType === 'url' || rawType === 'email' || rawType === 'number'
      ? rawType
      : 'text'
  return {
    name,
    label,
    required: Boolean(raw.required),
    type,
    placeholder: textValue(raw.placeholder),
    help: textValue(raw.help || raw.hint || raw.description),
  }
}

function isUserSocialPassword(field) {
  const name = String(field?.name || '').toLowerCase()
  const label = String(field?.label || '').toLowerCase()
  if (/app|client|api|secret|key/.test(name) || /app|client|api|secret/.test(label)) return false
  return name === 'password' || (label.includes('password') && !label.includes('secret'))
}

export function mapConnectForm(raw, platform) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const fields = extractList(source, ['fields'])
    .map(mapConnectField)
    .filter(Boolean)
    .filter((field) => !isUserSocialPassword(field))
  const fallback = fallbackConnectForm(platform)
  return {
    title: textValue(source.title) || fallback.title,
    clientAsk: textValue(source.clientAsk || source.client_ask) || fallback.clientAsk,
    helpUrl: textValue(source.helpUrl || source.help_url || source.helpURL) || fallback.helpUrl,
    fields: fields.length ? fields : fallback.fields,
  }
}

export function fallbackConnectForm(platform) {
  const name = textValue(platform) || 'Account'
  const key = name.toLowerCase()
  const field = (fieldName, label, required = true, type = 'text') => ({
    name: fieldName,
    label,
    required,
    type,
    placeholder: '',
    help: '',
  })

  if (key === 'instagram' || key === 'facebook') {
    return {
      title: `Connect ${name}`,
      clientAsk:
        'Ask the client for Meta App ID + App Secret + Page/account name. Instagram must be a Business account linked to a Facebook Page.',
      helpUrl: 'https://developers.facebook.com',
      fields: [
        field('appId', 'App ID'),
        field('appSecret', 'App Secret', true, 'password'),
        field('accountName', 'Account Name'),
        field('pageId', 'Page ID', false),
      ],
    }
  }
  if (key === 'whatsapp') {
    return {
      title: 'Connect WhatsApp',
      clientAsk: 'Ask the client for Meta App ID + App Secret + Business Account ID + Phone Number ID.',
      helpUrl: 'https://developers.facebook.com',
      fields: [
        field('appId', 'App ID'),
        field('appSecret', 'App Secret', true, 'password'),
        field('businessAccountId', 'Business Account ID'),
        field('phoneNumberId', 'Phone Number ID'),
      ],
    }
  }
  if (key === 'tiktok') {
    return {
      title: 'Connect TikTok',
      clientAsk: 'Ask the client for TikTok Client Key + Client Secret.',
      helpUrl: '',
      fields: [
        field('clientKey', 'Client Key'),
        field('clientSecret', 'Client Secret', true, 'password'),
        field('accountName', 'Account Name', false),
      ],
    }
  }
  if (key === 'youtube') {
    return {
      title: 'Connect YouTube',
      clientAsk: 'Ask the client for Google Client ID + Client Secret.',
      helpUrl: '',
      fields: [
        field('clientId', 'Client ID'),
        field('clientSecret', 'Client Secret', true, 'password'),
        field('accountName', 'Account Name', false),
      ],
    }
  }
  if (key === 'x' || key === 'twitter') {
    return {
      title: 'Connect X',
      clientAsk: 'Ask the client for X Client ID + Client Secret.',
      helpUrl: '',
      fields: [
        field('clientId', 'Client ID'),
        field('clientSecret', 'Client Secret', true, 'password'),
        field('accountName', 'Account Name', false),
      ],
    }
  }
  if (key === 'whatnot') {
    return {
      title: 'Connect Whatnot',
      clientAsk: 'Ask the client for Whatnot Client ID + Client Secret (if they have an app).',
      helpUrl: '',
      fields: [
        field('clientId', 'Client ID'),
        field('clientSecret', 'Client Secret', true, 'password'),
        field('accountName', 'Account Name', false),
      ],
    }
  }
  return {
    title: `Connect ${name}`,
    clientAsk: 'Ask the client for this network’s developer app keys. Do not ask for the social account password.',
    helpUrl: '',
    fields: [field('accountName', 'Account Name')],
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
    connectUrl: toApiPath(raw.connectUrl) || (raw.id || raw._id ? `/api/marketing/social-accounts/${raw.id || raw._id}/connect` : ''),
    disconnectUrl: toApiPath(raw.disconnectUrl) || (raw.id || raw._id ? `/api/marketing/social-accounts/${raw.id || raw._id}/disconnect` : ''),
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

export function connectPayload(form = {}) {
  const body = {}
  Object.entries(form).forEach(([key, value]) => {
    body[key] = typeof value === 'string' ? value.trim() : value ?? ''
  })
  return body
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

function platformCardsFromOptions(platforms) {
  const names = platforms.length ? platforms : DEFAULT_SOCIAL_PLATFORMS
  return names
    .map((platform) => mapSocialAccount({
      id: platform,
      platform,
      status: 'DISCONNECTED',
    }))
    .filter(Boolean)
}

export async function getSocialAccounts() {
  const payload = await apiRequest('/api/marketing/social-accounts')
  const options = mapOptions(payload.options ?? payload.data?.options)
  const items = extractAccountList(payload)
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map(mapSocialAccount)
    .filter(Boolean)

  return {
    items: items.length ? items : platformCardsFromOptions(options.platforms),
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

export async function connectSocialAccount(id, form, connectUrl) {
  const path = toApiPath(connectUrl) || `/api/marketing/social-accounts/${id}/connect`
  const payload = await apiRequest(path, {
    method: 'POST',
    body: connectPayload(form),
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
