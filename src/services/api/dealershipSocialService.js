import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function isOn(value) {
  if (value === true) return true
  const text = String(value || '').toUpperCase()
  return text === 'ON' || text === 'TRUE' || text === 'YES'
}

function mapAccount(raw) {
  if (!raw || typeof raw !== 'object') return null
  const sourceOn = isOn(raw.model31Source ?? raw.model31_social_source)
  return {
    id: raw.id || raw._id || raw.accountId,
    platform: textValue(raw.platform) || 'Social',
    accountName: textValue(raw.accountName || raw.name || raw.handle),
    owner: textValue(raw.owner || raw.ownerType) || 'Dealership',
    status: textValue(raw.status) || 'CONNECTED',
    model31Source: sourceOn ? 'ON' : 'OFF',
    model31_social_source: sourceOn,
    lastSync: formatStamp(raw.lastSync || raw.updatedAt) || '—',
    posts: Number(raw.posts ?? 0) || 0,
    followers: Number(raw.followers ?? 0) || 0,
    reach: Number(raw.reach ?? 0) || 0,
    leads: Number(raw.leads ?? 0) || 0,
    engagement: Number(raw.engagement ?? 0) || 0,
  }
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

export async function disconnectDealershipSocialAccount(id) {
  await apiRequest(`/api/dealership/social-accounts/${id}/disconnect`, {
    method: 'POST',
  })
  return true
}

const dealershipSocialService = {
  getDealershipSocialAccounts,
  updateDealershipSocialSource,
  disconnectDealershipSocialAccount,
}

export default dealershipSocialService
