import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'
import { INVENTORY_STATUSES } from '../../data/inventory'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function formatDate(value) {
  if (!value) return ''
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return str
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function asOptions(raw, fallback, allLabel) {
  const items = (Array.isArray(raw) ? raw : [])
    .map((item) => textValue(item))
    .filter(Boolean)
  const rest = (items.length ? items : fallback).filter(
    (item) => !String(item).toLowerCase().startsWith('all '),
  )
  const all = items.find((item) => String(item).toLowerCase().startsWith('all ')) || allLabel
  return [{ value: '', label: all }, ...rest.map((item) => ({ value: item, label: item }))]
}

function vehicleName(raw) {
  const named = textValue(raw.vehicle || raw.name || raw.title)
  if (named) return named
  return [raw.year, raw.make, raw.model].filter(Boolean).join(' ').trim()
}

export function mapInventoryVehicle(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const make = textValue(raw.make)
  const model = textValue(raw.model)
  const year = numberValue(raw.year) || textValue(raw.year)
  return {
    id: raw.id || raw._id || raw.vehicleId || `inv_${String(index + 1).padStart(3, '0')}`,
    vin: textValue(raw.vin, '—'),
    vehicle: vehicleName(raw) || 'Vehicle',
    year: year || '—',
    make: make || '—',
    model: model || '—',
    trim: textValue(raw.trim, '—'),
    price: numberValue(raw.price, raw.currentPrice),
    originalPrice: numberValue(raw.originalPrice, raw.msrp, raw.price),
    previousPrice: numberValue(raw.previousPrice),
    priceChangeDate: formatDate(raw.priceChangeDate || raw.priceChangedAt) || null,
    mileage: numberValue(raw.mileage, raw.miles, raw.odometer),
    color: textValue(raw.color, '—'),
    status: textValue(raw.status, 'AVAILABLE').toUpperCase(),
    dealership: textValue(raw.dealership || raw.dealershipName, '—'),
    daysInInventory: numberValue(raw.daysInInventory, raw.days, raw.ageDays),
    lastUpdated:
      formatDate(raw.lastUpdated || raw.updatedAt || raw.updated) ||
      formatStamp(raw.lastUpdated || raw.updatedAt) ||
      '—',
    priceHistory: extractList(raw, ['priceHistory', 'prices']).map((row, idx) => ({
      date: formatDate(row.date || row.at || row.createdAt) || textValue(row.date, '—'),
      price: numberValue(row.price, row.amount),
      label: textValue(row.label || row.type, idx === 0 ? 'Original' : 'Update'),
    })),
    inventoryHistory: extractList(raw, ['inventoryHistory', 'history', 'events']).map(
      (row, idx) => ({
        date: formatDate(row.date || row.at || row.createdAt) || textValue(row.date, '—'),
        event: textValue(row.event || row.title || row.message, 'Inventory update'),
        actor: textValue(row.actor || row.user || row.by, 'System'),
        id: row.id || row._id || `hist_${idx}`,
      }),
    ),
  }
}

function mapInsight(row, index = 0) {
  if (!row) return null
  if (typeof row === 'string') {
    return { id: `sig_${index + 1}`, type: row, detail: '', severity: 'INFO' }
  }
  return {
    id: row.id || row._id || `sig_${index + 1}`,
    type: textValue(row.type || row.title || row.label, 'Insight'),
    detail: textValue(row.detail || row.message || row.description),
    severity: textValue(row.severity || row.level || row.status, 'INFO').toUpperCase(),
  }
}

function mapMetrics(raw = {}) {
  return {
    totalVehicles: numberValue(raw.totalVehicles, raw.total),
    available: numberValue(raw.available),
    reserved: numberValue(raw.reserved),
    sold: numberValue(raw.sold),
    lowInventory: numberValue(raw.lowInventory, raw.low),
    priceChanges: numberValue(raw.priceChanges),
  }
}

const FALLBACK_FILTERS = {
  statuses: asOptions(INVENTORY_STATUSES, INVENTORY_STATUSES, 'All statuses'),
  dealerships: [{ value: '', label: 'All dealerships' }],
  makes: [{ value: '', label: 'All makes' }],
  prices: [
    { value: '', label: 'All prices' },
    { value: 'Under $50,000', label: 'Under $50,000' },
    { value: '$50,000 - $70,000', label: '$50,000 - $70,000' },
    { value: 'Over $70,000', label: 'Over $70,000' },
  ],
}

export async function getInventory({
  search = '',
  status = '',
  dealership = '',
  make = '',
  price = '',
  page = 1,
  limit = 8,
} = {}) {
  const params = new URLSearchParams({
    search: String(search || ''),
    status: String(status || ''),
    dealership: String(dealership || ''),
    make: String(make || ''),
    price: String(price || ''),
    page: String(page),
    limit: String(limit),
  })

  const payload = await apiRequest(`/api/super-admin/inventory?${params.toString()}`)
  const filters = payload.filters || payload.filterOptions || {}
  const items = extractList(payload, ['vehicles', 'inventory', 'items'])
    .map(mapInventoryVehicle)
    .filter(Boolean)

  return {
    metrics: mapMetrics(payload.metrics || payload.stats || payload.kpis || {}),
    insights: extractList(payload, ['insights', 'signals']).map(mapInsight).filter(Boolean),
    filters: {
      statuses: asOptions(filters.statuses, INVENTORY_STATUSES, 'All statuses'),
      dealerships: asOptions(filters.dealerships, [], 'All dealerships'),
      makes: asOptions(filters.makes, [], 'All makes'),
      prices: asOptions(
        filters.prices,
        FALLBACK_FILTERS.prices.map((item) => item.label),
        'All prices',
      ),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getInventoryById(id) {
  const payload = await apiRequest(`/api/super-admin/inventory/${id}`)
  const raw = extractItem(payload, ['vehicle', 'item', 'inventory']) || payload
  return mapInventoryVehicle(raw)
}

export const EMPTY_INVENTORY = {
  metrics: mapMetrics(),
  insights: [],
  filters: FALLBACK_FILTERS,
  items: [],
  total: 0,
}
