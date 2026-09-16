import { apiRequest } from './http'
import { extractItem, textValue } from './payload'

export async function getProfile() {
  const payload = await apiRequest('/api/profile')
  const raw = extractItem(payload, ['user', 'profile']) || payload?.data || payload
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id,
    name: textValue(raw.name || raw.fullName),
    email: textValue(raw.email),
    role: textValue(raw.role),
    dealership: textValue(raw.dealership || raw.dealershipName),
    status: textValue(raw.status) || 'active',
    presence: String(raw.presence || raw.onlineStatus || '').toUpperCase() || '',
    avatar: textValue(raw.avatar),
  }
}

const profileService = { getProfile }

export default profileService
