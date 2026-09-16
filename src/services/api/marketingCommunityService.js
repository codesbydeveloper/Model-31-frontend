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

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function mapActivity(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `cact_${index}`,
    type: textValue(raw.activityType || raw.type),
    detail: textValue(raw.detail || raw.message),
    time: formatStamp(raw.createdAt || raw.time) || textValue(raw.time),
  }
}

export function mapCommunity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const metrics = raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : {}
  const qualified = numberValue(
    raw.qualified,
    raw.qualifiedLeads,
    metrics.qualified,
    metrics.qualifiedLeads,
  )
  const activitySource = raw.recentActivity || raw.activity || []

  return {
    id: raw.id || raw._id,
    name: textValue(raw.community || raw.name),
    platform: textValue(raw.platform),
    location: textValue(raw.location),
    audience: numberValue(raw.audience, metrics.audience),
    engagement: numberValue(raw.engagement, metrics.engagement),
    leads: numberValue(raw.leads, metrics.leads),
    qualified,
    qualifiedLeads: qualified,
    appointments: numberValue(raw.appointments, metrics.appointments),
    status: textValue(raw.status) || 'ACTIVE',
    lastActivity: formatDate(raw.lastActivity) || textValue(raw.lastActivity),
    description: textValue(raw.description),
    activity: extractList(activitySource).map(mapActivity).filter(Boolean),
  }
}

export async function getCommunities({
  page = 1,
  limit = 8,
  search = '',
  status = 'ALL',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: String(search || ''),
    status: !status || status === 'all' ? 'ALL' : status,
  })
  const payload = await apiRequest(`/api/marketing/communities?${params.toString()}`)
  const items = extractList(payload, ['items', 'communities'])
    .map(mapCommunity)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getCommunity(id) {
  const payload = await apiRequest(`/api/marketing/communities/${id}`)
  return mapCommunity(extractItem(payload, ['community', 'item']))
}

const marketingCommunityService = {
  getCommunities,
  getCommunity,
}

export default marketingCommunityService
