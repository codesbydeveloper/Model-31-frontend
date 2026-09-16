import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function asJoinedList(value) {
  if (Array.isArray(value)) return value.map((item) => textValue(item)).filter(Boolean).join(', ')
  if (typeof value === 'string') return value.trim()
  return ''
}

function parseRange(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      min: numberValue(value.min, value.minimum),
      max: numberValue(value.max, value.maximum),
    }
  }
  if (typeof value !== 'string') return { min: 0, max: 0 }
  const nums = value.match(/[\d,]+(?:\.\d+)?/g) || []
  return {
    min: numberValue(nums[0]),
    max: numberValue(nums[1]),
  }
}

function isLimitRecord(raw) {
  return Boolean(raw && (raw.id || raw._id || raw.vin || raw.vehicle))
}

export function mapNegotiationLimit(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const payment = parseRange(raw.payment)
  const trade = parseRange(raw.trade)
  return {
    id: raw.id || raw._id || `neg_${String(index + 1).padStart(3, '0')}`,
    vin: textValue(raw.vin, '—'),
    vehicle: textValue(raw.vehicle || raw.name, 'Vehicle'),
    msrp: numberValue(raw.msrp),
    currentPrice: numberValue(raw.currentPrice, raw.price),
    minPrice: numberValue(raw.minimumPrice, raw.minPrice),
    maxDiscount: numberValue(raw.maximumDiscount, raw.maxDiscount),
    paymentMin: numberValue(raw.minimumPayment, raw.paymentMin, payment.min),
    paymentMax: numberValue(raw.maximumPayment, raw.paymentMax, payment.max),
    tradeMin: numberValue(raw.minimumTradeValue, raw.tradeMin, trade.min),
    tradeMax: numberValue(raw.maximumTradeValue, raw.tradeMax, trade.max),
    allowedIncentives: asJoinedList(raw.allowedIncentives),
    allowedFees: asJoinedList(raw.allowedFees),
    status: textValue(raw.status, 'ACTIVE').toUpperCase(),
    template: textValue(raw.template || raw.templateName, '—'),
    templateId: raw.templateId || raw.template?._id || raw.template?.id || '',
    statusOptions: extractList(raw, ['statusOptions', 'statuses'])
      .map((item) => textValue(item))
      .filter(Boolean),
  }
}

export function toNegotiationSavePayload(item) {
  return {
    vehicle: String(item.vehicle || '').trim(),
    vin: String(item.vin || '').trim(),
    msrp: Number(item.msrp) || 0,
    currentPrice: Number(item.currentPrice) || 0,
    minimumPrice: Number(item.minPrice) || 0,
    maximumDiscount: Number(item.maxDiscount) || 0,
    minimumPayment: Number(item.paymentMin) || 0,
    maximumPayment: Number(item.paymentMax) || 0,
    minimumTradeValue: Number(item.tradeMin) || 0,
    maximumTradeValue: Number(item.tradeMax) || 0,
    allowedIncentives: Array.isArray(item.allowedIncentives)
      ? item.allowedIncentives.join(', ')
      : String(item.allowedIncentives || ''),
    allowedFees: Array.isArray(item.allowedFees)
      ? item.allowedFees.join(', ')
      : String(item.allowedFees || ''),
    status: textValue(item.status, 'ACTIVE').toUpperCase(),
  }
}

export async function getNegotiationLimits({ search = '', page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)

  const payload = await apiRequest(
    `/api/super-admin/negotiation-control?${params.toString()}`,
  )
  const items = extractList(payload, ['rows', 'items', 'limits'])
    .map(mapNegotiationLimit)
    .filter(Boolean)

  return {
    pageTitle: textValue(payload.pageTitle, 'Negotiation Control'),
    description: textValue(
      payload.description,
      'Define the limits Model 31 may use when advanced deal assistance is enabled.',
    ),
    notice: textValue(
      payload.notice,
      'Model 31 cannot negotiate outside manager-defined limits. If negotiation limits are not configured, price negotiation is unavailable.',
    ),
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getNegotiationLimit(id, { edit = false } = {}) {
  const query = edit ? '?edit=1' : ''
  const payload = await apiRequest(
    `/api/super-admin/negotiation-control/${encodeURIComponent(id)}${query}`,
  )
  const raw = extractItem(payload, ['record', 'limit', 'item', 'negotiationControl'])
  if (!isLimitRecord(raw)) return null
  return mapNegotiationLimit(raw)
}

export async function saveNegotiationLimit(id, item) {
  const payload = await apiRequest(
    `/api/super-admin/negotiation-control/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: toNegotiationSavePayload(item),
    },
  )
  const raw = extractItem(payload, ['record', 'limit', 'item', 'negotiationControl'])
  if (isLimitRecord(raw)) return mapNegotiationLimit(raw)
  return { ...item, id: item.id || id }
}
