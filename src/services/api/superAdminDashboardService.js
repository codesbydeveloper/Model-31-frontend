import { API_BASE_URL } from '../../config/api'
import { apiRequest, ApiError, getAuthToken } from './http'
import {
  extractList,
  extractItem,
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

function mapTrend(value) {
  const text = textValue(value)
  if (!text) return null
  return {
    direction: text.trim().startsWith('-') ? 'down' : 'up',
    value: text,
  }
}

function zipSeries(categories, series) {
  const names = extractList(categories)
  const lines = extractList(series)
  return names.map((name, index) => {
    const row = { name: textValue(name, `Item ${index + 1}`) }
    for (const line of lines) {
      const key = String(textValue(line.name) || 'value')
        .replace(/\s+/g, '')
        .replace(/^./, (c) => c.toLowerCase())
      const data = extractList(line.data)
      row[key] = numberValue(data[index])
    }
    return row
  })
}

export function mapFingerprint(raw) {
  const print = extractItem(raw, ['fingerprint']) || raw || {}
  const details = print.details || {}
  return {
    leadId: textValue(print.leadId || details.leadId),
    badges: extractList(print, ['badges']).map((item) => textValue(item)).filter(Boolean),
    timeline: extractList(print, ['timeline']).map((row, index) => ({
      step: textValue(row.step || row.label, `Step ${index + 1}`),
      value: textValue(row.value || row.detail),
    })),
    details: {
      contentId: textValue(details.contentId),
      leadId: textValue(details.leadId || print.leadId),
      source: textValue(details.source),
      engagementTimestamp: textValue(details.engagementTimestamp),
      conversationTimestamp: textValue(details.conversationTimestamp),
      leadQualification: textValue(details.leadQualification),
      dispatchTimestamp: textValue(details.dispatchTimestamp),
      assignedSalesperson: textValue(details.assignedSalesperson),
      appointment: textValue(details.appointment),
      saleStatus: textValue(details.saleStatus),
      model31Access: textValue(details.model31Access),
    },
  }
}

const KPI_ORDER = [
  { key: 'totalLeads', label: 'Total Leads' },
  { key: 'qualifiedLeads', label: 'Qualified Leads' },
  { key: 'routedLeads', label: 'Routed Leads' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'sold', label: 'Sold' },
  { key: 'conversionRate', label: 'Conversion Rate' },
]

export async function getDashboardKpis() {
  const payload = await apiRequest('/api/super-admin/dashboard/kpis')
  const kpis = payload.kpis || payload.data?.kpis || {}
  return KPI_ORDER.map((item) => {
    const raw = kpis[item.key] || {}
    return {
      key: item.key,
      label: textValue(raw.label, item.label),
      value: numberValue(raw.value),
      unit: textValue(raw.unit),
      hint: textValue(raw.subtitle || raw.hint),
      trend: mapTrend(raw.trend),
    }
  })
}

export async function getNuclearMode() {
  const payload = await apiRequest('/api/super-admin/dashboard/nuclear-mode')
  const raw = extractItem(payload, ['nuclearMode']) || payload
  const metrics = raw.metrics || {}
  return {
    enabled: raw.enabled === true || String(raw.status).toUpperCase() === 'ON',
    status: textValue(raw.status, raw.enabled ? 'ON' : 'OFF') || 'OFF',
    activeDeals: numberValue(metrics.activeDeals, raw.activeDeals),
    qualifiedBuyers: numberValue(metrics.qualifiedBuyers, raw.qualifiedBuyers),
    managerHandoffs: numberValue(metrics.managerHandoffs, raw.managerHandoffs),
    dealsReady: numberValue(metrics.dealsReady, raw.dealsReady),
  }
}

export async function setNuclearMode(enabled) {
  const payload = await apiRequest('/api/super-admin/dashboard/nuclear-mode', {
    method: 'PATCH',
    body: { enabled: Boolean(enabled) },
  })
  const raw = extractItem(payload, ['nuclearMode']) || payload
  const metrics = raw.metrics || {}
  return {
    enabled: raw.enabled === true || String(raw.status).toUpperCase() === 'ON',
    status: textValue(raw.status, enabled ? 'ON' : 'OFF') || (enabled ? 'ON' : 'OFF'),
    activeDeals: numberValue(metrics.activeDeals, raw.activeDeals),
    qualifiedBuyers: numberValue(metrics.qualifiedBuyers, raw.qualifiedBuyers),
    managerHandoffs: numberValue(metrics.managerHandoffs, raw.managerHandoffs),
    dealsReady: numberValue(metrics.dealsReady, raw.dealsReady),
  }
}

export async function getBuyerGenome() {
  const payload = await apiRequest('/api/super-admin/dashboard/buyer-genome')
  return extractList(payload, ['items']).map((row, index) => ({
    id: row.id || row.leadId || `genome_${index}`,
    leadId: row.leadId || row.id,
    customerName: textValue(row.name || row.customerName, `Buyer ${index + 1}`),
    intent: textValue(row.badge || row.intent, 'HIGH'),
    urgency: numberValue(row.urgency),
    hesitation: numberValue(row.hesitation),
    tone: textValue(row.source || row.tone),
  }))
}

export async function getDealsReady() {
  const payload = await apiRequest('/api/super-admin/dashboard/deals-ready')
  return extractList(payload, ['items']).map((row, index) => ({
    id: row.id || row.handoffId || `deal_${index}`,
    leadId: row.leadId,
    customerName: textValue(row.customer || row.customerName || row.name),
    vehicle: textValue(row.vehicle),
    salesperson: textValue(row.salesperson),
    priority: textValue(row.priority),
  }))
}

export async function getManagerHandoffs() {
  const payload = await apiRequest('/api/super-admin/dashboard/manager-handoffs')
  const items = extractList(payload, ['items']).map((row, index) => ({
    id: row.id || row.handoffId || `handoff_${index}`,
    customerName: textValue(row.name || row.customerName || row.customer),
    dealStatus: textValue(row.status || row.dealStatus),
  }))
  return {
    summary: textValue(payload.summary, `${items.length} structured deals in review.`),
    count: numberValue(payload.count, items.length),
    items,
  }
}

export async function getNegotiationControls() {
  const payload = await apiRequest('/api/super-admin/dashboard/negotiation-controls')
  const raw = extractItem(payload, ['negotiationControls']) || payload
  return {
    description: textValue(
      raw.description,
      'Manager-defined price, payment and trade limits.',
    ),
    items: extractList(raw, ['items']).map((row) => ({
      label: textValue(row.label),
      value: textValue(row.value),
    })),
    actions: extractList(raw, ['actions']).map((item) => textValue(item)).filter(Boolean),
  }
}

export async function getBuyOnlineReadiness() {
  const payload = await apiRequest('/api/super-admin/dashboard/buy-online-readiness')
  const raw = extractItem(payload, ['buyOnlineReadiness']) || payload
  return {
    description: textValue(raw.description),
    nuclearMode: textValue(raw.nuclearMode, 'OFF'),
    intentRequired: textValue(raw.intentRequired, 'HIGH'),
    dealStatus: textValue(raw.dealStatus, 'DEAL READY'),
    available: raw.available === true,
  }
}

export async function getDashboardLeads({
  search = '',
  tier = 'All tiers',
  status = 'All statuses',
  rooftop = 'All rooftops',
  page = 1,
  limit = 8,
} = {}) {
  const params = new URLSearchParams({
    search: String(search || ''),
    tier: tier || 'All tiers',
    status: status || 'All statuses',
    rooftop: rooftop || 'All rooftops',
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/super-admin/dashboard/leads?${params.toString()}`)
  const items = extractList(payload, ['leads', 'items']).map((row) => ({
    id: row.leadId || row.id,
    customerName: textValue(row.customer || row.customerName),
    source: textValue(row.source),
    dealership: textValue(row.rooftop || row.dealership),
    vehicle: textValue(row.vehicle),
    score: numberValue(row.score),
    tier: textValue(row.tier),
    status: textValue(row.status),
    salesperson: textValue(row.salesperson, 'Unassigned'),
    lastActivity: textValue(row.lastActivity),
  }))
  const filters = payload.filters || payload.options || {}
  return {
    items,
    tiers: extractList(filters, ['tiers']).map((item) => textValue(item)).filter(Boolean),
    statuses: extractList(filters, ['statuses']).map((item) => textValue(item)).filter(Boolean),
    rooftops: extractList(filters, ['rooftops']).map((item) => textValue(item)).filter(Boolean),
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getDashboardLead(id) {
  const payload = await apiRequest(`/api/super-admin/dashboard/leads/${id}`)
  const row = extractItem(payload, ['lead']) || payload
  return {
    id: row.leadId || row.id,
    customerName: textValue(row.customer || row.customerName),
    source: textValue(row.source),
    dealership: textValue(row.rooftop || row.dealership),
    vehicle: textValue(row.vehicle),
    score: numberValue(row.score),
    tier: textValue(row.tier),
    status: textValue(row.status),
    salesperson: textValue(row.salesperson, 'Unassigned'),
    lastActivity: textValue(row.lastActivity),
  }
}

export async function getFingerprint(leadId) {
  const payload = await apiRequest(`/api/super-admin/dashboard/fingerprint/${leadId}`)
  return mapFingerprint(payload)
}

export async function getDispatchMap() {
  const payload = await apiRequest('/api/super-admin/dashboard/dispatch-map')
  const raw = extractItem(payload, ['dispatchMap']) || payload
  return {
    subtitle: textValue(raw.subtitle, 'Lead → Rooftop → Available Salesperson'),
    legend: extractList(raw, ['legend']).map((item) => textValue(item)).filter(Boolean),
    cities: extractList(raw, ['cities']).map((row, index) => ({
      id: row.id || `city_${index}`,
      city: textValue(row.city),
      rooftop: textValue(row.rooftop),
      nodes: extractList(row, ['nodes']).map((node, nodeIndex) => ({
        id: node.id || `${row.city || index}_${node.type || 'node'}_${nodeIndex}`,
        type: textValue(node.type, 'lead'),
        status: textValue(node.status).toUpperCase(),
      })),
    })),
  }
}

export async function getSmartInbox() {
  const payload = await apiRequest('/api/super-admin/dashboard/smart-inbox')
  return extractList(payload, ['items']).map((row, index) => ({
    id: row.leadId || row.id || `inbox_${index}`,
    customerName: textValue(row.customer || row.customerName),
    latestMessage: textValue(row.snippet || row.latestMessage || row.message),
    tier: textValue(row.tier),
    score: numberValue(row.score),
    priority: textValue(row.urgency || row.priority),
    salesperson: textValue(row.agent || row.salesperson, 'Unassigned'),
    time: textValue(row.time),
  }))
}

export async function getRooftopPerformance() {
  const payload = await apiRequest('/api/super-admin/dashboard/rooftop-performance')
  const raw = extractItem(payload, ['rooftopPerformance']) || payload
  const chart = raw.chart || {}
  const chartRows = zipSeries(chart.categories, chart.series).map((row) => ({
    dealership: row.name,
    qualified: numberValue(row.qualified),
    sold: numberValue(row.sold),
  }))
  const table = extractList(raw, ['table']).map((row) => ({
    dealership: textValue(row.rooftop || row.dealership),
    leads: numberValue(row.leads),
    qualified: numberValue(row.qualified),
    routed: numberValue(row.routed),
    appointments: numberValue(row.appointments),
    sold: numberValue(row.sold),
    conversionRate: numberValue(row.conversion, row.conversionRate),
  }))
  return {
    chart: chartRows.length ? chartRows : table,
    table,
  }
}

export async function getActivityFeed() {
  const payload = await apiRequest('/api/super-admin/dashboard/activity-feed')
  return extractList(payload, ['items']).map((row, index) => ({
    id: row.id || `activity_${index}`,
    name: textValue(row.name || row.customer || row.customerName),
    message: textValue(row.message || row.snippet),
    tier: textValue(row.tier),
    score: numberValue(row.score),
    priority: textValue(row.urgency || row.priority),
    salesperson: textValue(row.agent || row.salesperson),
    time: textValue(row.time),
  }))
}

export async function getSocialEngine() {
  const payload = await apiRequest('/api/super-admin/dashboard/social-engine')
  const raw = extractItem(payload, ['socialEngine']) || payload
  return {
    subtitle: textValue(
      raw.subtitle,
      'Content performance by platform. Visualization only.',
    ),
    rows: extractList(raw, ['rows', 'items']).map((row, index) => ({
      id: row.id || `soc_${index}`,
      platform: textValue(row.platform),
      content: textValue(row.content),
      engagement: numberValue(row.engagement),
      leads: row.leads == null ? null : numberValue(row.leads),
      qualified: row.qualified == null ? null : numberValue(row.qualified),
      sold: row.sold == null ? null : numberValue(row.sold),
    })),
  }
}

export async function getLeadWorkflow() {
  const payload = await apiRequest('/api/super-admin/dashboard/lead-workflow')
  const raw = extractItem(payload, ['leadWorkflow']) || payload
  return {
    title: textValue(raw.title, 'Staff Social → Official Dealer'),
    source: textValue(raw.source, 'Staff Personal Social Account'),
    status: textValue(raw.status, 'MODEL 31 LEAD'),
    steps: extractList(raw, ['steps']).map((item) => textValue(item)).filter(Boolean),
  }
}

export async function getCrmSync() {
  const payload = await apiRequest('/api/super-admin/dashboard/crm-sync')
  const raw = extractItem(payload, ['crmSync']) || payload
  const info = raw.info || {}
  return {
    title: textValue(raw.title, 'CRM Read-Only Sync'),
    description: textValue(
      raw.description,
      'Model 31 reads dealership CRM records. It does not write back.',
    ),
    status: textValue(raw.crmStatus || raw.status, 'Connected'),
    mode: textValue(raw.mode || info.crmMode, 'READ ONLY'),
    lastSync: textValue(raw.lastSync),
    recordsRead: numberValue(raw.recordsRead),
    newUpdates: numberValue(raw.newUpdates),
    errors: numberValue(raw.errors),
    info: {
      crmMode: textValue(info.crmMode, 'READ ONLY'),
      pipeline: textValue(info.pipeline, 'DEALERSHIP'),
      source: textValue(info.source, 'CRM'),
      model31Access: textValue(info.model31Access, 'READ ONLY'),
      note: textValue(info.note, 'Model 31 does not modify dealership leads.'),
    },
  }
}

export async function getOemReporting(brand = 'All Brands') {
  const params = new URLSearchParams({
    brand: brand || 'All Brands',
  })
  const payload = await apiRequest(
    `/api/super-admin/dashboard/oem-reporting?${params.toString()}`,
  )
  const raw = extractItem(payload, ['oemReporting']) || payload
  return {
    readOnly: raw.readOnly !== false,
    reportingMonth: textValue(raw.reportingMonth, 'August 2026'),
    brands: extractList(raw, ['brandsFilter', 'brands']).map((item) => textValue(item)).filter(Boolean),
    selectedBrand: textValue(raw.selectedBrand, brand || 'All Brands'),
    complianceNote: textValue(raw.complianceNote),
    footer: textValue(raw.footer),
    rows: extractList(raw, ['rows']).map((row, index) => ({
      id: row.id || `oem_${index}`,
      brand: textValue(row.brand),
      stores: extractList(row, ['stores']).map((item) => textValue(item)).filter(Boolean),
      optIns: numberValue(row.optIns),
      salesInfluenced: numberValue(row.salesInfluenced),
      attribution: numberValue(row.attribution),
      compliance: textValue(row.compliance),
    })),
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function exportOemReporting(format = 'csv') {
  const token = getAuthToken()
  const response = await fetch(
    `${API_BASE_URL}/api/super-admin/dashboard/oem-reporting/export?format=${encodeURIComponent(format)}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    },
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(
      body?.message || body?.error || `Export failed (${response.status})`,
      response.status,
      body,
    )
  }
  const blob = await response.blob()
  const match = String(response.headers.get('content-disposition') || '').match(
    /filename="?([^"]+)"?/i,
  )
  downloadBlob(blob, match?.[1] || `oem.${format}`)
}

export async function getUnderwaterRescue() {
  const payload = await apiRequest('/api/super-admin/dashboard/underwater-rescue')
  const raw = extractItem(payload, ['underwaterRescue']) || payload
  const kpis = raw.kpis || {}
  const charts = raw.charts || {}
  const rescue = charts.rescueActivity || {}
  const revenue = charts.revenueRecovered || {}
  return {
    badge: textValue(raw.badge, 'Included Free in Model 31'),
    description: textValue(raw.description),
    kpis: {
      rescuedLeads: numberValue(kpis.rescuedLeads),
      rescuedAppointments: numberValue(kpis.rescuedAppointments),
      rescuedSales: numberValue(kpis.rescuedSales),
      averageGross: numberValue(kpis.averageGross),
      revenueMonth: numberValue(kpis.revenueRecoveredThisMonth, kpis.revenueMonth),
      revenueYear: numberValue(kpis.revenueRecoveredThisYear, kpis.revenueYear),
    },
    rescueChart: zipSeries(rescue.weeks, rescue.series).map((row) => ({
      name: row.name,
      rescued: numberValue(row.rescued),
      appointments: numberValue(row.appointments),
      sales: numberValue(row.sales),
    })),
    revenueChart: extractList(revenue, ['weeks']).map((week, index) => ({
      name: textValue(week, `Week ${index + 1}`),
      revenue: numberValue(extractList(revenue, ['data'])[index]),
    })),
    signalBreakdown: extractList(charts, ['signalSourceBreakdown']).map((row) => ({
      source: textValue(row.source),
      count: numberValue(row.count),
    })),
  }
}

export async function getUnderwaterRescueActivity({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(
    `/api/super-admin/dashboard/underwater-rescue/activity?${params.toString()}`,
  )
  const items = extractList(payload, ['activity', 'items']).map((row) => ({
    id: row.id,
    leadId: row.leadId,
    signalSource: textValue(row.signalSource),
    rescueMethod: textValue(row.rescueMethod),
    status: textValue(row.status),
    timestamp: textValue(row.timestamp),
    sale: row.sale === true || String(row.sale).toLowerCase() === 'yes' ? 'Yes' : 'No',
    recoveredAmount: numberValue(row.recoveredAmount),
  }))
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getRescueFingerprint(activityId) {
  const payload = await apiRequest(
    `/api/super-admin/dashboard/underwater-rescue/activity/${activityId}/fingerprint`,
  )
  return mapFingerprint(payload)
}

const superAdminDashboardService = {
  getDashboardKpis,
  getNuclearMode,
  setNuclearMode,
  getBuyerGenome,
  getDealsReady,
  getManagerHandoffs,
  getNegotiationControls,
  getBuyOnlineReadiness,
  getDashboardLeads,
  getDashboardLead,
  getFingerprint,
  getDispatchMap,
  getSmartInbox,
  getRooftopPerformance,
  getActivityFeed,
  getSocialEngine,
  getLeadWorkflow,
  getCrmSync,
  getOemReporting,
  exportOemReporting,
  getUnderwaterRescue,
  getUnderwaterRescueActivity,
  getRescueFingerprint,
}

export default superAdminDashboardService
