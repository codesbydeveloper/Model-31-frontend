import { apiRequest } from './http'

function parseBrands(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.dealerships)) return data.dealerships
  if (Array.isArray(payload?.dealerships)) return payload.dealerships
  if (Array.isArray(data?.items)) return data.items
  return []
}

function extractItem(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.id || payload._id || payload.name) return payload
  const data = payload.data
  if (data && typeof data === 'object') {
    if (data.id || data._id || data.name) return data
    if (data.dealership) return data.dealership
  }
  return payload.dealership || null
}

function extractPagination(payload, { page, limit, itemCount }) {
  const meta =
    payload?.pagination ||
    payload?.meta ||
    payload?.data?.pagination ||
    payload?.data?.meta ||
    (payload?.data && !Array.isArray(payload.data) ? payload.data : null) ||
    payload

  const total = Number(
    meta?.total ??
      meta?.totalItems ??
      meta?.totalCount ??
      payload?.total ??
      payload?.count ??
      itemCount,
  )
  const currentPage = Number(meta?.page ?? meta?.currentPage ?? page) || page
  const pageSize = Number(meta?.limit ?? meta?.pageSize ?? limit) || limit
  const totalPages = Number(
    meta?.totalPages ??
      meta?.pages ??
      Math.max(1, Math.ceil((total || 0) / pageSize)),
  )

  return {
    page: currentPage,
    limit: pageSize,
    total: Number.isFinite(total) ? total : itemCount,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

export function mapDealership(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.dealershipId,
    name: raw.name || '',
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    zip: raw.zipCode || raw.zip || '',
    phone: raw.phone || '',
    website: raw.website || '',
    brands: parseBrands(raw.brands),
    timezone: raw.timezone || 'America/New_York',
    status: raw.status || 'Active',
    salespeople: Number(raw.salespeople ?? raw.salespersonCount ?? 0) || 0,
    activeLeads: Number(raw.activeLeads ?? 0) || 0,
    totalLeads: Number(raw.totalLeads ?? 0) || 0,
    qualifiedLeads: Number(raw.qualifiedLeads ?? 0) || 0,
    routedLeads: Number(raw.routedLeads ?? 0) || 0,
    closedDeals: Number(raw.closedDeals ?? 0) || 0,
    conversionRate: Number(raw.conversionRate ?? 0) || 0,
    crmStatus: raw.crmStatus || 'Disconnected',
    socialStatus: raw.socialStatus || 'Disconnected',
  }
}

function toApiPayload(form) {
  const brands =
    typeof form.brands === 'string'
      ? form.brands
      : (form.brands || []).join(', ')

  return {
    name: form.name.trim(),
    address: (form.address || '').trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipCode: (form.zip || form.zipCode || '').trim(),
    phone: (form.phone || '').trim(),
    website: (form.website || '').trim(),
    brands,
    timezone: form.timezone || 'America/New_York',
    status: form.status || 'Active',
  }
}

export async function getDealerships({
  page = 1,
  limit = 10,
  search = '',
  status = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)
  if (status && status !== 'all') params.set('status', status)

  const payload = await apiRequest(`/api/dealerships?${params.toString()}`)
  const items = extractList(payload).map(mapDealership).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getDealershipById(id) {
  const payload = await apiRequest(`/api/dealerships/${id}`)
  return mapDealership(extractItem(payload))
}

export async function createDealership(form) {
  const payload = await apiRequest('/api/dealerships', {
    method: 'POST',
    body: toApiPayload(form),
  })
  return mapDealership(extractItem(payload) || extractList(payload)[0]) || true
}

export async function updateDealership(id, form) {
  const payload = await apiRequest(`/api/dealerships/${id}`, {
    method: 'PUT',
    body: toApiPayload(form),
  })
  return mapDealership(extractItem(payload)) || true
}

export async function updateDealershipStatus(id, status) {
  const payload = await apiRequest(`/api/dealerships/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return mapDealership(extractItem(payload)) || true
}

export async function toggleDealershipStatus(id, currentStatus) {
  const next = currentStatus === 'Active' ? 'Inactive' : 'Active'
  return updateDealershipStatus(id, next)
}

function extractOptions(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.options)) return data.options
  if (Array.isArray(data?.dealerships)) return data.dealerships
  if (Array.isArray(payload?.options)) return payload.options
  if (Array.isArray(payload?.dealerships)) return payload.dealerships
  return []
}

function mapOption(raw) {
  if (raw == null) return null
  if (typeof raw === 'string') return { value: raw, label: raw }
  const value = raw.id || raw._id || raw.value || raw.dealershipId || raw.name
  const label = raw.name || raw.label || raw.title || String(value || '')
  if (!value) return null
  return { value: String(value), label: String(label) }
}

export async function getDealershipOptions() {
  const payload = await apiRequest('/api/dealerships/options')
  return extractOptions(payload).map(mapOption).filter(Boolean)
}

export async function getDealershipStaff(id) {
  const payload = await apiRequest(`/api/dealerships/${encodeURIComponent(id)}/salespeople`)
  const data = payload?.data ?? payload
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.salespeople)
      ? data.salespeople
      : Array.isArray(data?.users)
        ? data.users
        : extractList(payload)
  return list.map((row) => ({
    id: row.id || row._id,
    name: row.name || row.fullName || '',
    role: row.role || 'Salesperson',
    status: row.status || row.presence || '',
  })).filter((row) => row.id || row.name)
}

export async function getDealershipLeadList(id) {
  const payload = await apiRequest(`/api/dealerships/${encodeURIComponent(id)}/leads`)
  const data = payload?.data ?? payload
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.leads)
      ? data.leads
      : extractList(payload)
  return list.map((row) => ({
    id: row.id || row._id || row.leadId,
    name: row.customerName || row.name || '',
    source: row.source || '',
    score: row.score ?? '',
    status: row.status || '',
  })).filter((row) => row.id)
}

const dealershipService = {
  getDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  updateDealershipStatus,
  toggleDealershipStatus,
  getDealershipOptions,
  getDealershipStaff,
  getDealershipLeadList,
}

export default dealershipService
