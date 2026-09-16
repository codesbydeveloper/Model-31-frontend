import { apiRequest } from './http'

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.cities)) return data.cities
  if (Array.isArray(payload?.cities)) return payload.cities
  if (Array.isArray(data?.items)) return data.items
  return []
}

function unwrapCity(value) {
  if (!value) return null
  if (typeof value !== 'object') return null
  if (value.data && typeof value.data === 'object') {
    if (value.data.city && typeof value.data.city === 'object') return value.data.city
    if (value.data.id || value.data._id || value.data.name) return value.data
  }
  if (value.city && typeof value.city === 'object' && (value.city.id || value.city.name || value.city.city)) {
    return value.city
  }
  if (value.id || value._id || typeof value.name === 'string') return value
  return null
}

function extractItem(payload) {
  return unwrapCity(payload)
}

function textValue(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    if (typeof value.name === 'string') return value.name
    if (typeof value.city === 'string') return value.city
    if (typeof value.label === 'string') return value.label
    return ''
  }
  return ''
}

export function mapCity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const city = textValue(raw.name) || textValue(raw.city)
  return {
    id: raw.id || raw._id || raw.cityId || raw.city?.id,
    city,
    name: city,
    state: textValue(raw.state),
    country: textValue(raw.country) || 'USA',
    primaryLanguage: textValue(raw.primaryLanguage) || 'English',
    secondaryLanguage: textValue(raw.secondaryLanguage),
    regionalTone: textValue(raw.regionalTone),
    inventoryFocus: textValue(raw.inventoryFocus),
    financingFocus: textValue(raw.financingFocus) || 'Financing',
    dealerships: Number(raw.dealerships ?? raw.dealershipCount ?? 0) || 0,
    status: textValue(raw.status) || 'Active',
  }
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

function toApiPayload(form) {
  return {
    name: textValue(form.city) || textValue(form.name),
    state: textValue(form.state),
    country: textValue(form.country) || 'USA',
    primaryLanguage: form.primaryLanguage || 'English',
    secondaryLanguage: form.secondaryLanguage || '',
    regionalTone: form.regionalTone || '',
    inventoryFocus: form.inventoryFocus || '',
    financingFocus: form.financingFocus || 'Financing',
    status: form.status || 'Active',
  }
}

export async function getCities({
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

  const payload = await apiRequest(`/api/cities?${params.toString()}`)
  const items = extractList(payload).map(mapCity).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getCityById(id) {
  const payload = await apiRequest(`/api/cities/${id}`)
  return mapCity(extractItem(payload))
}

export async function createCity(form) {
  const payload = await apiRequest('/api/cities', {
    method: 'POST',
    body: toApiPayload(form),
  })
  return mapCity(extractItem(payload)) || true
}

export async function updateCity(id, form) {
  const payload = await apiRequest(`/api/cities/${id}`, {
    method: 'PUT',
    body: toApiPayload(form),
  })
  return mapCity(extractItem(payload)) || true
}

export async function deleteCity(id) {
  await apiRequest(`/api/cities/${id}`, { method: 'DELETE' })
  return true
}

const cityService = {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
}

export default cityService
