import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function isOn(value) {
  if (value === true) return true
  const text = String(value || '').toUpperCase()
  return text === 'ON' || text === 'TRUE' || text === 'YES'
}

function flag(value) {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  const text = String(value ?? '').toLowerCase()
  if (text === 'true') return true
  if (text === 'false') return false
  return null
}

function mapAccount(raw) {
  if (!raw || typeof raw !== 'object') return null
  const sourceOn = isOn(raw.model31Source ?? raw.model31_social_source)
  const status = (textValue(raw.status) || 'DISCONNECTED').toUpperCase()
  const superAdminConnected = flag(raw.superAdminConnected) === true
  const smsCard =
    String(raw.platform || '').toUpperCase() === 'SMS' ||
    raw.id === 'sms_account' ||
    raw.source === 'text_messages'
  const canConnect = smsCard
    ? flag(raw.canConnect) === true
    : flag(raw.canConnect) === true && superAdminConnected
  const canDisconnect = flag(raw.canDisconnect) === true
  return {
    id: raw.id || raw._id || raw.accountId,
    platform: textValue(raw.platform) || 'Social',
    accountName: textValue(raw.accountName || raw.name || raw.handle),
    owner: textValue(raw.owner || raw.ownerName || raw.ownerType) || 'Dealership',
    status,
    model31Source: sourceOn ? 'ON' : 'OFF',
    model31_social_source: sourceOn,
    lastSync: formatStamp(raw.lastSync || raw.updatedAt) || '—',
    posts: Number(raw.posts ?? 0) || 0,
    followers: Number(raw.followers ?? 0) || 0,
    reach: Number(raw.reach ?? 0) || 0,
    leads: Number(raw.leads ?? 0) || 0,
    engagement: Number(raw.engagement ?? 0) || 0,
    superAdminConnected,
    canConnect,
    canDisconnect,
    canSettings: flag(raw.canSettings) === true,
    providerType: textValue(raw.providerType || raw.provider_type),
    phoneNumber: textValue(raw.phoneNumber || raw.phone_number || raw.accountName),
    source: textValue(raw.source),
    lastUpdated: formatStamp(raw.lastUpdated || raw.last_updated || raw.updatedAt) || '',
  }
}

export function isSmsAccount(account) {
  if (!account) return false
  return (
    String(account.platform || '').toUpperCase() === 'SMS' ||
    account.id === 'sms_account' ||
    account.source === 'text_messages'
  )
}

export async function getDealershipSocialAccounts() {
  const payload = await apiRequest('/api/dealership/social-accounts')
  return extractList(payload, ['accounts', 'socialAccounts'])
    .map(mapAccount)
    .filter(Boolean)
}

export async function updateDealershipSocialSource(id, model31Source) {
  const payload = await apiRequest(`/api/dealership/social-accounts/${id}`, {
    method: 'PUT',
    body: { model31Source },
  })
  return mapAccount(extractItem(payload, ['account'])) || true
}

export async function connectDealershipSocialAccount(id) {
  await apiRequest(`/api/marketing/social-accounts/${encodeURIComponent(id)}/connect`, {
    method: 'POST',
    body: {},
  })
  return true
}

export async function disconnectDealershipSocialAccount(id) {
  await apiRequest(`/api/dealership/social-accounts/${encodeURIComponent(id)}/disconnect`, {
    method: 'POST',
  })
  return true
}

const dealershipSocialService = {
  getDealershipSocialAccounts,
  updateDealershipSocialSource,
  connectDealershipSocialAccount,
  disconnectDealershipSocialAccount,
}

export default dealershipSocialService
