export function extractList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function extractItem(payload, keys = []) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.id || payload._id) return payload
  const data = payload.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.id || data._id) return data
    for (const key of keys) {
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        return data[key]
      }
    }
    return data
  }
  for (const key of keys) {
    if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
      return payload[key]
    }
  }
  return payload
}

export function extractPagination(payload, { page, limit, itemCount }) {
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

export function textValue(value, fallback = '') {
  if (value == null || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return value.name || value.fullName || value.label || value.title || fallback
  }
  return fallback
}

export function formatStamp(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
