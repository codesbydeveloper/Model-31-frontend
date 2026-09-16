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

function mapTrend(rows, valueKey) {
  return extractList(rows).map((row, index) => ({
    name: textValue(row.name || row.week || row.label, `W${index + 1}`),
    value: numberValue(row.value, row[valueKey], row.engagement, row.leads, row.conversion),
  }))
}

export function mapMarketingPersona(raw) {
  if (!raw || typeof raw !== 'object') return null
  const metrics = raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : {}
  const trends = raw.trends && typeof raw.trends === 'object' ? raw.trends : {}
  const platforms = Array.isArray(raw.platforms)
    ? raw.platforms.map((item) => textValue(item)).filter(Boolean)
    : []

  return {
    id: raw.id || raw._id,
    name: textValue(raw.name),
    description: textValue(raw.description),
    targetAudience: textValue(raw.targetAudience || raw.audience),
    audience: textValue(raw.targetAudience || raw.audience),
    tone: textValue(raw.tone),
    language: textValue(raw.language),
    primaryPlatform: textValue(raw.primaryPlatform),
    platforms,
    status: textValue(raw.status) || 'ACTIVE',
    engagement: numberValue(raw.engagement, metrics.engagement),
    leads: numberValue(raw.leads, metrics.leads),
    appointments: numberValue(raw.appointments, metrics.appointments),
    sold: numberValue(raw.sold, metrics.sold),
    followers: numberValue(raw.followers, metrics.followers),
    dmInteractions: numberValue(raw.dmInteractions, metrics.dmInteractions),
    storyInteractions: numberValue(raw.storyInteractions, metrics.storyInteractions),
    returningVisitors: numberValue(raw.returningVisitors, metrics.returningVisitors),
    intentSignals: numberValue(raw.intentSignals, metrics.intentSignals),
    chartEngagement: mapTrend(
      trends.engagementTrend || raw.chartEngagement,
      'engagement',
    ),
    chartLeads: mapTrend(trends.leadsTrend || raw.chartLeads, 'leads'),
    chartConversion: mapTrend(
      trends.conversionTrend || raw.chartConversion,
      'conversion',
    ),
  }
}

export async function getMarketingPersonas({ search = '', status = 'ALL' } = {}) {
  const params = new URLSearchParams({
    search: String(search || ''),
    status: !status || status === 'all' ? 'ALL' : status,
  })
  const payload = await apiRequest(`/api/marketing/personas?${params.toString()}`)
  return extractList(payload, ['items', 'personas'])
    .map(mapMarketingPersona)
    .filter(Boolean)
}

export async function getMarketingPersona(id) {
  const payload = await apiRequest(`/api/marketing/personas/${id}`)
  return mapMarketingPersona(extractItem(payload, ['persona', 'item']))
}

export async function createMarketingPersona(form) {
  const payload = await apiRequest('/api/marketing/personas', {
    method: 'POST',
    body: {
      name: String(form.name || '').trim(),
      description: String(form.description || '').trim(),
      targetAudience: String(form.targetAudience || '').trim(),
      tone: form.tone,
      language: form.language,
      primaryPlatform: form.primaryPlatform,
      status: form.status,
    },
  })
  return mapMarketingPersona(extractItem(payload, ['persona', 'item']))
}

const marketingPersonaService = {
  getMarketingPersonas,
  getMarketingPersona,
  createMarketingPersona,
}

export default marketingPersonaService
