import { apiRequest } from './http'

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.personas)) return data.personas
  if (Array.isArray(data?.buyerPersonas)) return data.buyerPersonas
  if (Array.isArray(payload?.personas)) return payload.personas
  if (Array.isArray(payload?.buyerPersonas)) return payload.buyerPersonas
  if (Array.isArray(data?.items)) return data.items
  return []
}

function unwrapPersona(value) {
  if (!value || typeof value !== 'object') return null
  if (value.data && typeof value.data === 'object') {
    if (value.data.persona && typeof value.data.persona === 'object') return value.data.persona
    if (value.data.buyerPersona && typeof value.data.buyerPersona === 'object') {
      return value.data.buyerPersona
    }
    if (value.data.id || value.data._id || value.data.name) return value.data
  }
  if (value.persona && typeof value.persona === 'object') return value.persona
  if (value.buyerPersona && typeof value.buyerPersona === 'object') return value.buyerPersona
  if (value.id || value._id || typeof value.name === 'string') return value
  return null
}

function textValue(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    if (typeof value.name === 'string') return value.name
    if (typeof value.label === 'string') return value.label
    if (typeof value.value === 'string') return value.value
    return ''
  }
  return ''
}

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return null
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

export function mapPersona(raw) {
  if (!raw || typeof raw !== 'object') return null
  const budget = raw.budget && typeof raw.budget === 'object' ? raw.budget : {}

  return {
    id: raw.id || raw._id || raw.personaId,
    name: textValue(raw.name),
    description: textValue(raw.description),
    minBudget: numberValue(raw.minBudget, raw.min_budget, raw.budgetMin, budget.min),
    maxBudget: numberValue(raw.maxBudget, raw.max_budget, raw.budgetMax, budget.max),
    vehiclePreference: textValue(
      raw.vehiclePreference ||
        raw.vehicle_preference ||
        raw.preferredVehicle ||
        raw.vehicle,
    ),
    buyingTimeline: textValue(
      raw.buyingTimeline || raw.buying_timeline || raw.timeline,
    ),
    financingPreference: textValue(
      raw.financingPreference ||
        raw.financing_preference ||
        raw.financing ||
        raw.financePreference,
    ),
    language: textValue(raw.language) || 'English',
    status: textValue(raw.status) || 'Active',
  }
}

function toApiPayload(form) {
  return {
    name: textValue(form.name).trim(),
    description: textValue(form.description).trim(),
    minBudget: Number(form.minBudget) || 0,
    maxBudget: Number(form.maxBudget) || 0,
    vehiclePreference: textValue(form.vehiclePreference).trim(),
    buyingTimeline: textValue(form.buyingTimeline).trim(),
    financingPreference: textValue(form.financingPreference).trim(),
    language: textValue(form.language) || 'English',
    status: textValue(form.status) || 'Active',
  }
}

export async function getPersonas({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)

  const payload = await apiRequest(`/api/buyer-personas?${params.toString()}`)
  const items = extractList(payload).map(mapPersona).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getPersonaById(id) {
  const payload = await apiRequest(`/api/buyer-personas/${id}`)
  return mapPersona(unwrapPersona(payload))
}

export async function createPersona(form) {
  const payload = await apiRequest('/api/buyer-personas', {
    method: 'POST',
    body: toApiPayload(form),
  })
  return mapPersona(unwrapPersona(payload)) || true
}

export async function updatePersona(id, form) {
  const payload = await apiRequest(`/api/buyer-personas/${id}`, {
    method: 'PUT',
    body: toApiPayload(form),
  })
  return mapPersona(unwrapPersona(payload)) || true
}

export async function deletePersona(id) {
  await apiRequest(`/api/buyer-personas/${id}`, { method: 'DELETE' })
  return true
}

const personaService = {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
}

export default personaService
