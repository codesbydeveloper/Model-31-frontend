import { apiRequest } from './http'

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.templates)) return data.templates
  if (Array.isArray(data?.negotiationTemplates)) return data.negotiationTemplates
  if (Array.isArray(payload?.templates)) return payload.templates
  if (Array.isArray(payload?.negotiationTemplates)) return payload.negotiationTemplates
  if (Array.isArray(data?.items)) return data.items
  return []
}

function unwrapTemplate(value) {
  if (!value || typeof value !== 'object') return null
  if (value.data && typeof value.data === 'object') {
    if (value.data.template && typeof value.data.template === 'object') {
      return value.data.template
    }
    if (value.data.id || value.data._id || value.data.name) return value.data
  }
  if (value.template && typeof value.template === 'object') return value.template
  if (value.id || value._id || typeof value.name === 'string') return value
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

function textValue(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map((item) => textValue(item)).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    if (typeof value.name === 'string') return value.name
    if (typeof value.label === 'string') return value.label
    if (typeof value.value === 'string') return value.value
    return ''
  }
  return ''
}

function vinValue(value) {
  if (typeof value === 'string') return value.trim()
  return textValue(value.vin || value.VIN || value.code).trim()
}

function formatUpdated(value) {
  if (!value) return ''
  if (String(value).toLowerCase() === 'just now') return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function normalizeStatus(value) {
  const status = textValue(value).toUpperCase()
  if (status === 'INACTIVE' || status === 'DISABLED') return 'INACTIVE'
  return status || 'ACTIVE'
}

export function mapNegotiationTemplate(raw) {
  if (!raw || typeof raw !== 'object') return null

  const assignedVins = (
    raw.assignedVins ||
    raw.assignedVINs ||
    raw.vins ||
    raw.vehicles ||
    []
  )
    .map(vinValue)
    .filter(Boolean)

  return {
    id: raw.id || raw._id || raw.templateId,
    name: textValue(raw.name),
    description: textValue(raw.description),
    vehicleType: textValue(raw.vehicleType) || 'New',
    vehicleCount: Number(raw.vehicleCount ?? raw.assignedCount ?? assignedVins.length) || 0,
    minPriceRule: textValue(raw.minPriceRule),
    maxDiscountRule: textValue(raw.maxDiscountRule),
    paymentRange: textValue(raw.paymentRange),
    tradeRange: textValue(raw.tradeRange),
    allowedIncentives: textValue(raw.allowedIncentives),
    allowedFees: textValue(raw.allowedFees),
    status: normalizeStatus(raw.status),
    lastUpdated: formatUpdated(raw.lastUpdated || raw.updatedAt || raw.createdAt),
    assignedVins,
  }
}

function toApiPayload(form) {
  return {
    name: textValue(form.name).trim(),
    description: textValue(form.description).trim(),
    vehicleType: textValue(form.vehicleType) || 'New',
    status: normalizeStatus(form.status),
    minPriceRule: textValue(form.minPriceRule).trim(),
    maxDiscountRule: textValue(form.maxDiscountRule).trim(),
    paymentRange: textValue(form.paymentRange).trim(),
    tradeRange: textValue(form.tradeRange).trim(),
    allowedIncentives: textValue(form.allowedIncentives).trim(),
    allowedFees: textValue(form.allowedFees).trim(),
  }
}

export async function getNegotiationTemplates({
  page = 1,
  limit = 10,
  search = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)

  const payload = await apiRequest(`/api/negotiation-templates?${params.toString()}`)
  const items = extractList(payload).map(mapNegotiationTemplate).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getNegotiationTemplate(id) {
  const payload = await apiRequest(`/api/negotiation-templates/${id}`)
  return mapNegotiationTemplate(unwrapTemplate(payload))
}

export async function createNegotiationTemplate(form) {
  const payload = await apiRequest('/api/negotiation-templates', {
    method: 'POST',
    body: toApiPayload(form),
  })
  return mapNegotiationTemplate(unwrapTemplate(payload)) || true
}

export async function updateNegotiationTemplate(id, form) {
  const payload = await apiRequest(`/api/negotiation-templates/${id}`, {
    method: 'PUT',
    body: toApiPayload(form),
  })
  return (
    mapNegotiationTemplate(unwrapTemplate(payload)) ||
    mapNegotiationTemplate({ ...form, id })
  )
}

export async function duplicateNegotiationTemplate(id) {
  const payload = await apiRequest(`/api/negotiation-templates/${id}/duplicate`, {
    method: 'POST',
  })
  return mapNegotiationTemplate(unwrapTemplate(payload)) || true
}

export async function updateNegotiationTemplateStatus(id, status) {
  const payload = await apiRequest(`/api/negotiation-templates/${id}/status`, {
    method: 'PATCH',
    body: { status: normalizeStatus(status) },
  })
  return mapNegotiationTemplate(unwrapTemplate(payload)) || true
}

export async function deleteNegotiationTemplate(id) {
  await apiRequest(`/api/negotiation-templates/${id}`, { method: 'DELETE' })
  return true
}

const negotiationTemplateService = {
  getNegotiationTemplates,
  getNegotiationTemplate,
  createNegotiationTemplate,
  updateNegotiationTemplate,
  duplicateNegotiationTemplate,
  updateNegotiationTemplateStatus,
  deleteNegotiationTemplate,
}

export default negotiationTemplateService
