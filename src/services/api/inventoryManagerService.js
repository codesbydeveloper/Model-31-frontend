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

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function mapVehicle(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw._id || raw.stockNumber || `inv_m_${index}`
  const year = textValue(raw.year)
  const make = textValue(raw.make)
  const model = textValue(raw.model)
  return {
    id: String(id),
    stockNumber: textValue(raw.stockNumber || raw.stock, String(id)),
    vin: textValue(raw.vin),
    year,
    make,
    model,
    vehicle: textValue(raw.vehicle) || [year, make, model].filter(Boolean).join(' '),
    price: numberValue(raw.price),
    daysInStock: numberValue(raw.daysInStock, raw.days),
    photoCount: numberValue(raw.photoCount, raw.photos),
    merchStatus: textValue(raw.merchStatus || raw.status, 'Needs Photos'),
    dealership: textValue(raw.dealership || raw.dealershipName),
  }
}

export async function getInventoryManagerDashboard() {
  const payload = await apiRequest('/api/inventory-manager/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload?.data || payload
  const stats = raw.stats || raw.summary || raw

  return {
    dealership: textValue(raw.dealership || raw.dealershipName || stats.dealership),
    subtitle: textValue(raw.subtitle || raw.description),
    needsPhotos: numberValue(stats.needsPhotos, stats.needsPhoto),
    processed: numberValue(stats.processed),
    live: numberValue(stats.live),
    aged: numberValue(stats.aged, stats.agedInventory),
    inventory: extractList(raw, ['inventory', 'vehicles', 'items', 'snapshot'])
      .map(mapVehicle)
      .filter(Boolean),
  }
}

export async function getInventoryManagerInventory() {
  const payload = await apiRequest('/api/inventory-manager/inventory')
  return extractList(payload, ['inventory', 'vehicles', 'items']).map(mapVehicle).filter(Boolean)
}

export async function getInventoryManagerPhotos() {
  const payload = await apiRequest('/api/inventory-manager/photos')
  return extractList(payload, ['photos', 'vehicles', 'items', 'inventory'])
    .map(mapVehicle)
    .filter(Boolean)
}

export async function getInventoryManagerVehicle(id) {
  const payload = await apiRequest(
    `/api/inventory-manager/inventory/${encodeURIComponent(id)}`,
  )
  return mapVehicle(extractItem(payload, ['vehicle', 'item', 'inventory']))
}

export default {
  getInventoryManagerDashboard,
  getInventoryManagerInventory,
  getInventoryManagerPhotos,
  getInventoryManagerVehicle,
}
