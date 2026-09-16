import { apiRequest } from './http'
import { extractItem, extractList, textValue } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

export async function getDealershipReportSummary() {
  const payload = await apiRequest('/api/dealership/reports/summary')
  const raw = extractItem(payload, ['summary', 'report']) || payload?.data || payload
  return {
    dealership: textValue(raw.dealership || raw.dealershipName) || 'Dealership',
    leads: numberValue(raw.leads, raw.totalLeads),
    qualified: numberValue(raw.qualified, raw.qualifiedLeads),
    appointments: numberValue(raw.appointments),
    sold: numberValue(raw.sold, raw.soldDeals),
    revenue: numberValue(raw.revenue),
    conversionRate: numberValue(raw.conversionRate, raw.conversion),
  }
}

function formatChartDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(value)
    if (Number.isNaN(fallback.getTime())) return String(value)
    return fallback.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function rate(part, whole) {
  if (!whole) return 0
  return Number(((Number(part) / Number(whole)) * 100).toFixed(1))
}

export async function getDealershipDashboard() {
  const payload = await apiRequest('/api/dealership/dashboard')
  const raw =
    payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? payload.data
      : payload
  const stats = raw.stats || raw.summary || raw
  const dealership = raw.dealership || {}

  const leadsToday = numberValue(stats.leadsToday, raw.leadsToday)
  const qualifiedLeads = numberValue(stats.qualifiedLeads, raw.qualifiedLeads)
  const assignedLeads = numberValue(stats.assignedLeads, raw.assignedLeads)
  const appointments = numberValue(stats.appointments, raw.appointments)
  const soldDeals = numberValue(stats.soldDeals, raw.soldDeals, stats.sold)
  const revenue = numberValue(stats.revenue, raw.revenue)

  return {
    dealership:
      textValue(
        dealership.name ||
          dealership.title ||
          raw.dealershipName ||
          (typeof raw.dealership === 'string' ? raw.dealership : ''),
      ) || 'Dealership',
    leadsToday,
    qualifiedLeads,
    assignedLeads,
    appointments,
    soldDeals,
    revenue,
    conversionRate: rate(soldDeals, qualifiedLeads || assignedLeads || leadsToday),
    averageDeal: soldDeals > 0 ? Math.round(revenue / soldDeals) : 0,
    leadTrend: extractList(raw, ['leadTrend', 'trend']).map((row) => ({
      date: textValue(row.label) || formatChartDate(row.date) || textValue(row.date),
      leads: numberValue(row.leads, row.count),
      qualified: numberValue(row.qualified),
    })),
    leadSources: extractList(raw, ['leadSources', 'sources']).map((row) => ({
      name: textValue(row.source || row.name || row.label),
      value: numberValue(row.value, row.count, row.leads),
    })),
    salesFunnel: extractList(raw, ['salesFunnel', 'funnel']).map((row) => {
      const stage = textValue(row.stage || row.name || row.label)
      return {
        stage: stage === 'Leads' ? 'Leads Today' : stage,
        count: numberValue(row.count, row.value),
      }
    }),
  }
}

const dealershipReportService = {
  getDealershipReportSummary,
  getDealershipDashboard,
}

export default dealershipReportService
