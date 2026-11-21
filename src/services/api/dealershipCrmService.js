import { API_BASE_URL } from '../../config/api'
import { withLoading } from '../../context/loadingStore'
import { apiRequest, ApiError, getAuthToken } from './http'
import { extractItem, extractList, extractPagination, textValue, formatStamp } from './payload'

function mapCrm(raw) {
  if (!raw || typeof raw !== 'object') return null
  const activity = extractList(raw.activity || raw.events || raw.recentActivity, [])
  return {
    crmName: textValue(raw.crmName || raw.name || raw.provider) || 'CRM',
    status: textValue(raw.status || raw.connectionStatus) || 'CONNECTED',
    lastSync: formatStamp(raw.lastSync || raw.updatedAt) || '—',
    leadsSynced: Number(raw.leadsSynced ?? raw.leads ?? 0) || 0,
    customersSynced: Number(raw.customersSynced ?? raw.customers ?? 0) || 0,
    appointmentsSynced: Number(raw.appointmentsSynced ?? raw.appointments ?? 0) || 0,
    soldDealsSynced: Number(raw.soldDealsSynced ?? raw.soldDeals ?? raw.sold ?? 0) || 0,
    syncErrors: Number(raw.syncErrors ?? raw.errors ?? 0) || 0,
    activity: activity.map((item, index) => ({
      id: item.id || item._id || `crm_act_${index}`,
      event: textValue(item.event || item.message || item.type) || 'Sync event',
      status: textValue(item.status) || 'Success',
      crm: textValue(item.crm || raw.crmName),
      time: formatStamp(item.time || item.createdAt) || '—',
    })),
  }
}

export async function getDealershipCrm() {
  const payload = await apiRequest('/api/dealership/crm')
  return mapCrm(extractItem(payload, ['crm']) || payload)
}

export async function syncDealershipCrm() {
  const payload = await apiRequest('/api/dealership/crm/sync', { method: 'POST' })
  return mapCrm(extractItem(payload, ['crm'])) || true
}

function mapBdcLead(raw) {
  if (!raw || typeof raw !== 'object') return null
  const status = textValue(raw.status) || 'NEW'
  const sold = status.toUpperCase() === 'CLOSED'
  return {
    id: raw.id || raw._id,
    name: textValue(raw.customerName || raw.name),
    phone: textValue(raw.customerPhone || raw.phone),
    vehicle: textValue(raw.vehicleInterest || raw.vehicle),
    tradeIn: textValue(raw.tradeIn || raw.trade_in) || '—',
    status,
    canMarkSold: raw.canMarkSold === undefined ? !sold : Boolean(raw.canMarkSold),
  }
}

export async function getBdcLeads({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/dealership/leads?${params.toString()}`)
  const items = extractList(payload, ['leads']).map(mapBdcLead).filter((lead) => lead?.id)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

function uploadFile(path, file) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest(path, { method: 'POST', body })
}

export async function uploadBdcLeads(file) {
  const payload = await uploadFile('/api/dealership/crm/leads/upload', file)
  return textValue(payload?.message) || 'Leads uploaded.'
}

export async function uploadBdcInventory(file) {
  const payload = await uploadFile('/api/dealership/crm/inventory/upload', file)
  return textValue(payload?.message) || 'Inventory uploaded.'
}

export async function markBdcLeadSold(id) {
  const payload = await apiRequest(
    `/api/dealership/crm/leads/${encodeURIComponent(id)}/mark-sold`,
    { method: 'POST' },
  )
  return textValue(payload?.message) || 'Lead marked sold.'
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

async function downloadSample(path, fallbackName) {
  const token = getAuthToken()
  return withLoading(async () => {
    let response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
    } catch {
      throw new ApiError(
        `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
      )
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new ApiError(
        body?.message || body?.error || `Request failed (${response.status})`,
        response.status,
        body,
      )
    }

    const disposition = response.headers.get('content-disposition') || ''
    const match = String(disposition).match(/filename="?([^"]+)"?/i)
    downloadBlob(await response.blob(), match?.[1] || fallbackName)
  })
}

export function downloadBdcLeadsSample() {
  return downloadSample('/api/dealership/crm/leads/sample', 'sample-leads.csv')
}

export function downloadBdcInventorySample() {
  return downloadSample('/api/dealership/crm/inventory/sample', 'sample-inventory.csv')
}

function formatSoldDate(value) {
  const text = textValue(value)
  if (!text) return '—'
  const date = new Date(text.length === 10 ? `${text}T00:00:00` : text)
  if (Number.isNaN(date.getTime())) return text
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function mapSoldCharge(raw, index) {
  if (!raw || typeof raw !== 'object') return null
  const amount = Number(raw.amount ?? raw.charge ?? 31)
  return {
    id: String(raw.id || raw._id || `sold_${index}`),
    buyerName: textValue(raw.buyerName || raw.buyer_name || raw.customerName || raw.name) || '—',
    buyerPhone: textValue(raw.buyerPhone || raw.buyer_phone || raw.phone) || '—',
    vin: textValue(raw.vin) || '—',
    soldDate: formatSoldDate(raw.soldDate || raw.sold_date || raw.saleDate || raw.sale_date),
    amount: Number.isFinite(amount) ? amount : 31,
  }
}

export async function getBdcSoldCharges({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/dealership/crm/sold?${params.toString()}`)
  const items = extractList(payload, ['charges', 'sold', 'sales'])
    .map(mapSoldCharge)
    .filter((row) => row?.id)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function uploadBdcSold(file) {
  const payload = await uploadFile('/api/dealership/crm/sold/upload', file)
  return textValue(payload?.message) || 'Sold file uploaded.'
}

export function downloadBdcSoldSample() {
  return downloadSample('/api/dealership/crm/sold/sample', 'sample-sold.csv')
}

const dealershipCrmService = {
  getDealershipCrm,
  syncDealershipCrm,
  getBdcLeads,
  uploadBdcLeads,
  uploadBdcInventory,
  markBdcLeadSold,
  downloadBdcLeadsSample,
  downloadBdcInventorySample,
  getBdcSoldCharges,
  uploadBdcSold,
  downloadBdcSoldSample,
}

export default dealershipCrmService
