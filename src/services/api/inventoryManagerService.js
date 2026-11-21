import { apiRequest } from './http'
import { extractItem, extractList, extractPagination, textValue } from './payload'
import { mapVehicleImages } from '../../utils/vehicleImage'

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
    stockNumber: textValue(raw.stockNumber || raw.stock_number || raw.stock),
    vin: textValue(raw.vin),
    year,
    make,
    model,
    trim: textValue(raw.trim),
    mileage: raw.mileage == null || raw.mileage === '' ? '' : numberValue(raw.mileage),
    color: textValue(raw.color),
    vehicle: textValue(raw.vehicle) || [year, make, model].filter(Boolean).join(' '),
    price: numberValue(raw.price),
    minPrice: raw.minPrice == null || raw.minPrice === '' ? null : numberValue(raw.minPrice),
    daysInStock: numberValue(raw.daysInStock, raw.days),
    photoCount: numberValue(raw.photoCount, raw.photos),
    merchStatus: textValue(raw.merchStatus || raw.status, 'Needs Photos'),
    dealership: textValue(raw.dealership || raw.dealershipName),
    images: mapVehicleImages(raw),
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

export async function getInventoryManagerInventoryPage({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/inventory-manager/inventory?${params.toString()}`)
  const items = extractList(payload, ['inventory', 'vehicles', 'items']).map(mapVehicle).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

function inventoryBody(form) {
  const mileage = String(form.mileage ?? '').trim()
  return {
    vin: String(form.vin || '').trim(),
    year: form.year === '' || form.year == null ? undefined : Number(form.year),
    make: String(form.make || '').trim(),
    model: String(form.model || '').trim(),
    price: form.price === '' || form.price == null ? undefined : Number(form.price),
    trim: String(form.trim || '').trim(),
    mileage: mileage === '' ? null : Number(mileage.replace(/[^0-9.]/g, '')),
    color: String(form.color || '').trim(),
    stockNumber: String(form.stockNumber || '').trim(),
  }
}

export async function createInventoryManagerVehicle(form) {
  const payload = await apiRequest('/api/inventory-manager/inventory', {
    method: 'POST',
    body: inventoryBody(form),
  })
  return mapVehicle(extractItem(payload, ['vehicle', 'item']))
}

export async function updateInventoryManagerVehicle(id, form) {
  const payload = await apiRequest(
    `/api/inventory-manager/inventory/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: inventoryBody(form) },
  )
  return mapVehicle(extractItem(payload, ['vehicle', 'item']))
}

export async function deleteInventoryManagerImage(vehicleId, imageId) {
  await apiRequest(
    `/api/inventory-manager/inventory/${encodeURIComponent(vehicleId)}/images/${encodeURIComponent(imageId)}`,
    { method: 'DELETE' },
  )
}

export async function deleteInventoryManagerVehicle(id) {
  await apiRequest(`/api/inventory-manager/inventory/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
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
  updateInventoryManagerVehicle,
  deleteInventoryManagerImage,
  deleteInventoryManagerVehicle,
  getInventoryManagerPhotos,
  getInventoryManagerVehicle,
}
