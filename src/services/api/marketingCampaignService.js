import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'
import { mapMarketingContent } from './marketingContentService'
import { mapScheduledPost } from './marketingScheduledPostService'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function mapOptions(raw = {}) {
  return {
    dealerships: extractList(raw, ['dealerships'])
      .map((row) => ({
        id: row.id || row._id || row.value,
        name: textValue(row.name || row.label),
        status: textValue(row.status),
      }))
      .filter((row) => row.id),
    objectives: extractList(raw, ['objectives']).map((item) => textValue(item)).filter(Boolean),
    platforms: extractList(raw, ['platforms']).map((item) => textValue(item)).filter(Boolean),
    audiences: extractList(raw, ['audiences']).map((item) => textValue(item)).filter(Boolean),
    statuses: extractList(raw, ['statuses']).map((item) => textValue(item)).filter(Boolean),
  }
}

export function mapCampaign(raw, extras = {}) {
  if (!raw || typeof raw !== 'object') return null
  const metrics = extras.metrics || raw.metrics || raw.stats || {}
  const platforms = Array.isArray(raw.platforms)
    ? raw.platforms.map((item) => textValue(item)).filter(Boolean)
    : []

  return {
    id: raw.id || raw._id,
    name: textValue(raw.name),
    dealershipId: textValue(raw.dealershipId),
    dealership: textValue(raw.dealershipName || raw.dealership),
    objective: textValue(raw.objective),
    platforms,
    startDate: textValue(raw.startDate),
    endDate: textValue(raw.endDate),
    budget: numberValue(raw.budget),
    contentCount: numberValue(raw.contentCount, extras.content?.length),
    leads: numberValue(raw.leads, metrics.leads),
    status: textValue(raw.status) || 'ACTIVE',
    audience: textValue(raw.targetAudience || raw.audience),
    description: textValue(raw.description),
    stats: {
      reach: numberValue(metrics.reach),
      engagement: numberValue(metrics.engagement),
      leads: numberValue(metrics.leads, raw.leads),
      appointments: numberValue(metrics.appointments),
      soldDeals: numberValue(metrics.soldDeals, metrics.sold),
    },
    content: extractList(extras.content || raw.content)
      .map(mapMarketingContent)
      .filter(Boolean),
    scheduledPosts: extractList(extras.scheduledPosts || raw.scheduledPosts)
      .map(mapScheduledPost)
      .filter(Boolean),
    attribution: extractList(extras.attribution || raw.attribution).map((row, index) => ({
      id: row.id || `attr_${index}`,
      platform: textValue(row.platform),
      content: textValue(row.content || row.title),
      leads: numberValue(row.leads),
      qualifiedLeads: numberValue(row.qualifiedLeads, row.qualified),
      appointments: numberValue(row.appointments),
      soldDeals: numberValue(row.soldDeals, row.sold),
      revenue: numberValue(row.revenue),
    })),
  }
}

export async function getCampaigns({ page = 1, limit = 8, search = '', status = 'ALL' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (search) params.set('search', search)
  if (status && status !== 'all' && status !== 'ALL') params.set('status', status)

  const payload = await apiRequest(`/api/marketing/campaigns?${params.toString()}`)
  const items = extractList(payload, ['items', 'campaigns'])
    .map((row) => mapCampaign(row))
    .filter(Boolean)
  return {
    items,
    options: mapOptions(payload.options),
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getCampaign(id) {
  const payload = await apiRequest(`/api/marketing/campaigns/${id}`)
  return mapCampaign(extractItem(payload, ['campaign', 'item']), {
    metrics: payload.metrics,
    content: payload.content,
    scheduledPosts: payload.scheduledPosts,
    attribution: payload.attribution,
  })
}

export async function createCampaign(form) {
  const payload = await apiRequest('/api/marketing/campaigns', {
    method: 'POST',
    body: {
      name: String(form.name || '').trim(),
      dealershipId: form.dealershipId,
      objective: form.objective,
      platforms: form.platforms || [],
      startDate: form.startDate,
      endDate: form.endDate,
      budget: Number(form.budget) || 0,
      targetAudience: form.targetAudience || form.audience,
      description: String(form.description || '').trim(),
    },
  })
  return mapCampaign(extractItem(payload, ['campaign', 'item']))
}

const marketingCampaignService = {
  getCampaigns,
  getCampaign,
  createCampaign,
}

export default marketingCampaignService
