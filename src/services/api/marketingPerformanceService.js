import { apiRequest } from './http'
import {
  extractList,
  extractPagination,
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

function allOrValue(value) {
  if (!value || value === 'all' || value === 'ALL') return 'ALL'
  return value
}

function filterParams({
  rangeDays = 30,
  dealershipId = 'ALL',
  platform = 'ALL',
  campaignId = 'ALL',
} = {}) {
  return {
    rangeDays: String(Number(rangeDays) || 30),
    dealershipId: allOrValue(dealershipId),
    platform: allOrValue(platform),
    campaignId: allOrValue(campaignId),
  }
}

function mapOptions(raw = {}) {
  return {
    periods: extractList(raw, ['periods']).map((row) => ({
      value: String(row.value ?? row.days ?? row),
      label: textValue(row.label || row.name, `${row.value ?? row} Days`),
    })).filter((row) => row.value),
    dealerships: extractList(raw, ['dealerships']).map((row) => ({
      id: row.id || row._id || row.value || 'ALL',
      name: textValue(row.name || row.label, 'All dealerships'),
    })),
    platforms: extractList(raw, ['platforms']).map((item) => textValue(item)).filter(Boolean),
    campaigns: extractList(raw, ['campaigns']).map((row) => ({
      id: row.id || row._id || row.value || 'ALL',
      name: textValue(row.name || row.label, 'All campaigns'),
    })),
    sortOptions: extractList(raw, ['sortOptions']).map((item) => textValue(item)).filter(Boolean),
  }
}

function mapTimeSeries(rows, valueKey) {
  return extractList(rows).map((row) => ({
    date: textValue(row.label || row.date),
    [valueKey]: numberValue(row.value, row[valueKey]),
  }))
}

function mapNamedLeads(rows) {
  return extractList(rows).map((row) => ({
    name: textValue(row.name || row.label),
    value: numberValue(row.leads, row.value),
  }))
}

export async function getPerformanceStats(filters = {}) {
  const params = new URLSearchParams(filterParams(filters))
  const payload = await apiRequest(`/api/marketing/performance/stats?${params.toString()}`)
  const stats = payload.stats || payload.data?.stats || {}
  return {
    stats: {
      reach: numberValue(stats.reach),
      impressions: numberValue(stats.impressions),
      engagement: numberValue(stats.engagement),
      clicks: numberValue(stats.clicks),
      leads: numberValue(stats.leads),
      appointments: numberValue(stats.appointments),
      soldDeals: numberValue(stats.soldDeals, stats.sold),
      revenue: numberValue(stats.revenue),
    },
    options: mapOptions(payload.options),
  }
}

export async function getPerformanceCharts(filters = {}) {
  const params = new URLSearchParams(filterParams(filters))
  const payload = await apiRequest(`/api/marketing/performance/charts?${params.toString()}`)
  const charts = payload.charts || payload.data?.charts || payload
  return {
    reachOverTime: mapTimeSeries(charts.reachOverTime, 'reach'),
    engagementOverTime: mapTimeSeries(charts.engagementOverTime, 'engagement'),
    leadsByPlatform: mapNamedLeads(charts.leadsByPlatform),
    leadsByCampaign: mapNamedLeads(charts.leadsByCampaign),
  }
}

export async function getTopContent({
  page = 1,
  limit = 8,
  sortBy = 'reach',
  ...filters
} = {}) {
  const params = new URLSearchParams({
    ...filterParams(filters),
    page: String(page),
    limit: String(limit),
    sortBy: sortBy || 'reach',
  })
  const payload = await apiRequest(`/api/marketing/performance/top-content?${params.toString()}`)
  const items = extractList(payload, ['items', 'content']).map((row) => ({
    id: row.id || row._id,
    content: textValue(row.title || row.content),
    platform: textValue(row.platform),
    reach: numberValue(row.reach),
    engagement: numberValue(row.engagement),
    clicks: numberValue(row.clicks),
    leads: numberValue(row.leads),
    appointments: numberValue(row.appointments),
  }))
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

const marketingPerformanceService = {
  getPerformanceStats,
  getPerformanceCharts,
  getTopContent,
}

export default marketingPerformanceService
