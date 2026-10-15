import { API_BASE_URL } from '../config/api'

export function vehicleImageUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^(https?:|blob:|data:)/i.test(value)) return value
  const base = String(API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? value : `/${value}`}`
}

export function mapVehicleImages(raw) {
  const source = Array.isArray(raw?.images)
    ? raw.images
    : Array.isArray(raw?.imageUrls)
      ? raw.imageUrls
      : []
  return source
    .map((item, index) => {
      if (!item) return null
      if (typeof item === 'string') {
        const url = vehicleImageUrl(item)
        return url ? { id: `img_${index}`, url } : null
      }
      const url = vehicleImageUrl(item.url || item.imageUrl || item.image_url || item.src)
      if (!url) return null
      return { id: item.id || item._id || `img_${index}`, url }
    })
    .filter(Boolean)
}
