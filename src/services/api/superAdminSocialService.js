import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function sourceOn(value) {
  if (value === true) return true
  if (value === false) return false
  const text = String(value || '').toUpperCase()
  return text === 'ON' || text === 'TRUE' || text === '1'
}

function sourceLabel(value) {
  return sourceOn(value) ? 'ON' : 'OFF'
}

export function mapSocialPlatform(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const name = textValue(raw.name || raw.platform, 'Platform')
  const slug = textValue(raw.slug || raw.icon, name).toLowerCase().replace(/\s+/g, '')
  const connectionStatus = textValue(raw.connectionStatus, 'Disconnected')
  const connected = connectionStatus.toLowerCase() === 'connected'
  return {
    id: raw.id || raw._id || slug || `soc_${index + 1}`,
    slug,
    name,
    icon: textValue(raw.icon, slug),
    connectionStatus,
    status: textValue(raw.activityStatus || raw.status, connected ? 'Active' : 'Inactive'),
    lastActivity:
      textValue(raw.lastActivity) ||
      formatStamp(raw.lastActivityRaw || raw.lastActivityAt) ||
      'Never',
    posts: numberValue(raw.posts),
    canConnect: raw.canConnect ?? !connected,
    canDisconnect: raw.canDisconnect ?? connected,
    canSettings: raw.canSettings ?? true,
  }
}

export function mapStaffSocialAccount(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const model31On = sourceOn(raw.model31Source ?? raw.model31_social_source)
  return {
    id: raw.id || raw._id || raw.accountId || `soc_staff_${index + 1}`,
    accountName: textValue(raw.accountName || raw.account || raw.name, 'Account'),
    platform: textValue(raw.platform),
    owner: textValue(raw.ownerName || raw.owner),
    ownerType: textValue(raw.ownerType || raw.owner, '—'),
    status: textValue(raw.status, 'DISCONNECTED').toUpperCase(),
    model31Source: sourceLabel(raw.model31Source ?? raw.model31_social_source),
    model31_social_source: model31On,
  }
}

export function mapPlatformSettings(payload, fallbackName = 'Social') {
  const raw = extractItem(payload, ['settings', 'item']) || payload || {}
  const account = raw.account && typeof raw.account === 'object' ? raw.account : null
  return {
    platform: textValue(raw.platform, fallbackName),
    slug: textValue(raw.slug),
    title: textValue(raw.title, `${fallbackName} Settings`),
    placeholder: textValue(
      raw.placeholder || raw.message || raw.description,
      `Connect this account to manage inbox and posting settings.`,
    ),
    account: account
      ? {
          name: textValue(account.accountName || account.name),
          status: textValue(account.status),
        }
      : null,
  }
}

export async function getSocialIntegrations() {
  const payload = await apiRequest('/api/super-admin/social-integrations')
  const staff = payload.staffAccounts || payload.staff || {}
  return {
    pageTitle: textValue(payload.pageTitle, 'Social Integrations'),
    platforms: extractList(payload, ['platforms', 'items']).map(mapSocialPlatform).filter(Boolean),
    staffTitle: textValue(staff.title, 'Authorized Staff Social Accounts'),
    staffDescription: textValue(
      staff.description,
      'Engagement from accounts with Model 31 Source ON is treated as a Model 31 source.',
    ),
    staffAccounts: extractList(staff, ['rows', 'accounts', 'items'])
      .concat(Array.isArray(payload.staffAccounts) ? payload.staffAccounts : [])
      .map(mapStaffSocialAccount)
      .filter(Boolean),
  }
}

export async function getPlatformSettings(slug) {
  const payload = await apiRequest(
    `/api/super-admin/social-integrations/platforms/${slug}/settings`,
  )
  return mapPlatformSettings(payload, slug)
}

export async function connectPlatform(slug) {
  const payload = await apiRequest(
    `/api/super-admin/social-integrations/platforms/${slug}/connect`,
    { method: 'POST' },
  )
  return {
    message: textValue(payload.message, 'Social platform connected successfully.'),
    platform: mapSocialPlatform(payload.platform || extractItem(payload, ['platform', 'item'])),
  }
}

export async function disconnectPlatform(slug) {
  const payload = await apiRequest(
    `/api/super-admin/social-integrations/platforms/${slug}/disconnect`,
    { method: 'POST' },
  )
  return {
    message: textValue(payload.message, 'Social platform disconnected.'),
    platform: mapSocialPlatform(payload.platform || extractItem(payload, ['platform', 'item'])),
  }
}

export async function setStaffModel31Source(id, enabled) {
  const payload = await apiRequest(
    `/api/super-admin/social-integrations/staff-accounts/${id}`,
    {
      method: 'PATCH',
      body: { model31Source: enabled ? 'ON' : 'OFF' },
    },
  )
  return (
    mapStaffSocialAccount(extractItem(payload, ['account', 'staffAccount', 'item'])) ||
    mapStaffSocialAccount(payload)
  )
}
