import { ApiError, apiRequest } from './http'
import { extractList, extractPagination, textValue } from './payload'

export function isAccessBlocked(err) {
  if (!(err instanceof ApiError)) return false
  const message = `${err.message || ''} ${err.body?.message || ''} ${err.body?.error || ''}`
  return err.status === 403 || /access to model 31 is blocked/i.test(message)
}

function root(payload) {
  if (!payload || typeof payload !== 'object') return {}
  const data = payload.data
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : payload
  const copy = { ...source }
  delete copy.success
  return copy
}

function flattenValue(value) {
  if (value == null) return ''
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item == null) return ''
        if (typeof item !== 'object') return String(item)
        return item.event_type || item.eventType || item.type || item.message || textValue(item, JSON.stringify(item))
      })
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'object') {
    const named = textValue(value, '')
    if (named) return named
    if (value.intentTier || value.targetBand) {
      return `intent ${value.intentTier || '—'}, band ${value.targetBand || '—'}`
    }
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return value
}

export function asRows(payload, keys = []) {
  return extractList(payload, keys).map((row, index) => {
    if (!row || typeof row !== 'object') {
      return { _key: String(index), value: String(row ?? '') }
    }
    const flat = {}
    Object.entries(row).forEach(([key, value]) => {
      if (key === 'raw') return
      flat[key] = flattenValue(value)
    })
    const id = row.id || row._id || row.leadId || row.saleId || row.salespersonId || row.email
    return { ...flat, _key: String(id || index) }
  })
}

function pageQuery(page, limit) {
  return `?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`
}

async function readRecord(path) {
  const payload = await apiRequest(path)
  return root(payload)
}

async function readPage(path, keys, { page, limit }) {
  const payload = await apiRequest(`${path}${pageQuery(page, limit)}`)
  const items = asRows(payload, keys)
  return {
    record: root(payload),
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export function getModel31() {
  return readRecord('/api/model31')
}

export function getModel31Workflow() {
  return readRecord('/api/model31/workflow')
}

export function getModel31Routing() {
  return readRecord('/api/model31/routing')
}

export function getHygieneStats() {
  return readRecord('/api/crm/hygiene/stats')
}

export function getMeltPlate() {
  return readRecord('/api/crm/melt-plate')
}

export function getRoutingBands({ page = 1, limit = 20 } = {}) {
  return readPage('/api/model31/routing/bands', ['bands', 'salespeople', 'items'], { page, limit })
}

export function getRoutingLogs({ page = 1, limit = 20 } = {}) {
  return readPage('/api/model31/routing/logs', ['logs', 'routingLogs', 'items'], { page, limit })
}

export async function getModel31Guards({ page = 1, limit = 20 } = {}) {
  const payload = await apiRequest(`/api/model31/guards${pageQuery(page, limit)}`)
  const items = asRows(payload, ['events', 'guards', 'items'])
  const penalties = asRows(payload, ['penalties'])
  return {
    record: root(payload),
    items,
    penalties,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export function getQuarantine({ page = 1, limit = 20 } = {}) {
  return readPage('/api/crm/hygiene/quarantine', ['quarantine', 'leads', 'items'], { page, limit })
}

export function getHygieneLeads({ page = 1, limit = 20 } = {}) {
  return readPage('/api/crm/hygiene/leads', ['leads', 'items'], { page, limit })
}
