import { apiRequest } from './http'
import { extractList, extractItem, textValue } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function mapFunnelStep(row, index = 0) {
  const stage = textValue(row.stage || row.name || row.label, `Step ${index + 1}`)
  return {
    stage,
    count: numberValue(row.count, row.value, row.leads),
    conversion:
      textValue(row.conversionFormatted) ||
      (row.conversion != null || row.conversionRate != null
        ? `${numberValue(row.conversion, row.conversionRate).toFixed(1)}%`
        : ''),
  }
}

function mapSource(row, index = 0) {
  return {
    id: row.id || row._id || `src_${index}`,
    source: textValue(row.source || row.name, `Source ${index + 1}`),
    leads: numberValue(row.leads, row.totalLeads, row.count),
    qualified: numberValue(row.qualified, row.qualifiedLeads),
    appointments: numberValue(row.appointments),
    sold: numberValue(row.sold, row.soldDeals),
    revenue: numberValue(row.revenue),
  }
}

function mapDealership(row, index = 0) {
  return {
    id: row.id || row._id || `dlr_${index}`,
    dealership: textValue(row.dealership || row.name, `Dealership ${index + 1}`),
    leads: numberValue(row.leads, row.totalLeads),
    qualified: numberValue(row.qualified, row.qualifiedLeads),
    routed: numberValue(row.routed, row.routedLeads),
    appointments: numberValue(row.appointments),
    sold: numberValue(row.sold, row.soldDeals),
    revenue: numberValue(row.revenue),
    conversionRate: numberValue(row.conversionRate),
  }
}

function mapSalesperson(row, index = 0) {
  return {
    id: row.id || row._id || `sp_${index}`,
    name: textValue(row.name || row.salesperson, `Salesperson ${index + 1}`),
    dealership: textValue(row.dealership || row.dealershipName, '—'),
    accepted: numberValue(row.accepted, row.acceptedLeads),
    appointments: numberValue(row.appointments),
    sold: numberValue(row.sold, row.soldDeals),
    responseTime: textValue(row.responseTime || row.averageResponseTime, '—'),
    acceptanceRate: numberValue(row.acceptanceRate, row.leadAcceptanceRate),
  }
}

function mapNamedCount(row, index = 0, countKeys = ['leads']) {
  const countKey = countKeys[0]
  return {
    name: textValue(row.name || row.platform || row.campaign || row.dealership, `Item ${index + 1}`),
    leads: numberValue(row.leads, row.count),
    sold: numberValue(row.sold),
    reach: numberValue(row.reach),
    appointments: numberValue(row.appointments),
    revenue: numberValue(row.revenue),
    [countKey]: numberValue(row[countKey], row.leads, row.count, row.revenue),
  }
}

function mapJourneyStep(row, index = 0) {
  const stage = textValue(row.stage || row.name || row.label, `Step ${index + 1}`)
  const isCurrency =
    row.isCurrency === true ||
    String(row.type || '').toLowerCase() === 'currency' ||
    /revenue/i.test(stage)
  return {
    stage,
    count: numberValue(row.count, row.value, row.revenue),
    isCurrency,
  }
}

export const EMPTY_ANALYTICS = {
  pageTitle: 'Platform Analytics',
  kpis: {
    totalLeads: 0,
    qualifiedLeads: 0,
    routedLeads: 0,
    appointments: 0,
    soldDeals: 0,
    revenue: 0,
    conversionRate: 0,
    averageLeadScore: 0,
    averageResponseTime: '—',
  },
  funnel: [],
  sources: [],
  dealerships: [],
  ai: {
    aiConversations: 0,
    qualificationRate: 0,
    aiResponseTime: '—',
    aiAssistedLeads: 0,
    aiAppointments: 0,
    aiConversion: 0,
  },
  sales: {
    activeSalespeople: 0,
    averageResponseTime: '—',
    leadAcceptanceRate: 0,
    appointmentRate: 0,
    soldRate: 0,
  },
  salespeople: [],
  marketing: {
    reach: 0,
    engagement: 0,
    leads: 0,
    appointments: 0,
    sold: 0,
    revenue: 0,
    byPlatform: [],
    byCampaign: [],
    byDealership: [],
  },
  journey: [],
}

export async function getPlatformAnalytics() {
  const payload = await apiRequest('/api/super-admin/analytics')
  const raw = extractItem(payload, ['analytics']) || payload
  const summary = raw.summary || raw.kpis || raw.metrics || {}
  const ai = raw.aiPerformance || raw.ai || {}
  const salesRaw = raw.salesPerformance || raw.sales || {}
  const salesSummary = salesRaw.summary || salesRaw
  const marketingRaw = raw.marketingPerformance || raw.marketing || {}
  const marketingSummary = marketingRaw.summary || marketingRaw

  return {
    pageTitle: textValue(raw.pageTitle, 'Platform Analytics'),
    kpis: {
      totalLeads: numberValue(summary.totalLeads),
      qualifiedLeads: numberValue(summary.qualifiedLeads),
      routedLeads: numberValue(summary.routedLeads),
      appointments: numberValue(summary.appointments),
      soldDeals: numberValue(summary.soldDeals, summary.sold),
      revenue: numberValue(summary.revenue),
      conversionRate: numberValue(summary.conversionRate),
      averageLeadScore: numberValue(summary.averageLeadScore),
      averageResponseTime: textValue(summary.averageResponseTime, '—'),
    },
    funnel: extractList(raw, ['leadFunnel', 'funnel']).map(mapFunnelStep),
    sources: extractList(raw, ['leadSources', 'sources']).map(mapSource),
    dealerships: extractList(raw, ['dealershipPerformance', 'dealerships']).map(mapDealership),
    ai: {
      aiConversations: numberValue(ai.aiConversations, ai.conversations),
      qualificationRate: numberValue(ai.qualificationRate),
      aiResponseTime: textValue(ai.aiResponseTime, '—'),
      aiAssistedLeads: numberValue(ai.aiAssistedLeads),
      aiAppointments: numberValue(ai.aiAppointments),
      aiConversion: numberValue(ai.aiConversion),
    },
    sales: {
      activeSalespeople: numberValue(salesSummary.activeSalespeople),
      averageResponseTime: textValue(salesSummary.averageResponseTime, '—'),
      leadAcceptanceRate: numberValue(salesSummary.leadAcceptanceRate),
      appointmentRate: numberValue(salesSummary.appointmentRate),
      soldRate: numberValue(salesSummary.soldRate),
    },
    salespeople: extractList(salesRaw, ['salespeople', 'rows']).map(mapSalesperson),
    marketing: {
      reach: numberValue(marketingSummary.reach),
      engagement: numberValue(marketingSummary.engagement),
      leads: numberValue(marketingSummary.leads),
      appointments: numberValue(marketingSummary.appointments),
      sold: numberValue(marketingSummary.sold),
      revenue: numberValue(marketingSummary.revenue),
      byPlatform: extractList(marketingRaw, ['byPlatform', 'platforms']).map((row, index) =>
        mapNamedCount(row, index),
      ),
      byCampaign: extractList(marketingRaw, ['byCampaign', 'campaigns']).map((row, index) =>
        mapNamedCount(row, index),
      ),
      byDealership: extractList(marketingRaw, ['byDealership', 'dealerships']).map((row, index) =>
        mapNamedCount(row, index),
      ),
    },
    journey: extractList(raw, ['attributionJourney', 'journey']).map(mapJourneyStep),
  }
}
