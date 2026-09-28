import { apiRequest } from './http'
import { extractList, extractPagination, textValue } from './payload'

function root(payload) {
  if (!payload || typeof payload !== 'object') return {}
  const data = payload.data
  if (data && typeof data === 'object' && !Array.isArray(data)) return data
  return payload
}

function flattenValue(value) {
  if (value == null) return ''
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item == null) return ''
        if (typeof item !== 'object') return String(item)
        return item.event_type || item.eventType || item.type || item.message || textValue(item, '')
      })
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'object') return textValue(value, '')
  return value
}

function asRows(payload, keys) {
  return extractList(payload, keys).map((row, index) => {
    if (!row || typeof row !== 'object') {
      return { _key: String(index), value: String(row ?? '') }
    }
    const flat = {}
    Object.entries(row).forEach(([key, value]) => {
      if (key === 'lineItems' || key === 'transcript') return
      flat[key] = flattenValue(value)
    })
    const id = row.id || row._id || row.invoiceId || row.saleId || row.lineItemId
    return {
      ...flat,
      _key: String(id || index),
      _raw: row,
    }
  })
}

export async function uploadSoldLog({ dealershipId, units }) {
  const body = { units }
  if (dealershipId) body.dealershipId = dealershipId
  const payload = await apiRequest('/api/trust/sold-log', { method: 'POST', body })
  return root(payload)
}

export async function runAttribution({ dealershipId, month }) {
  const body = { month }
  if (dealershipId) body.dealershipId = dealershipId
  const payload = await apiRequest('/api/trust/attribution/run', { method: 'POST', body })
  return root(payload)
}

export async function getTrustInvoices({ page = 1, limit = 20 } = {}) {
  const payload = await apiRequest(`/api/trust/invoices?page=${page}&limit=${limit}`)
  const items = asRows(payload, ['invoices', 'items'])
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getTrustInvoice(id) {
  const payload = await apiRequest(`/api/trust/invoices/${encodeURIComponent(id)}`)
  const record = root(payload)
  const invoice = record.invoice && typeof record.invoice === 'object' ? record.invoice : record
  const lineSource = invoice.lineItems || record.lineItems || invoice.items || []
  const lineItems = (Array.isArray(lineSource) ? lineSource : []).map((row, index) => ({
    id: row.id || row._id || row.lineItemId || '',
    stockNumber: row.stockNumber || row.stock || row.stock_number || '',
    vin: row.vin || row.VIN || '',
    saleDate: row.saleDate || row.sale_date || '',
    influenced: row.influenced ?? row.influenceFlag ?? row.influencedFlag ?? '',
    events: flattenValue(row.events || row.eventList || row.audit_events || row.event_list),
    amount: row.amount ?? row.amountDue ?? '',
    _key: String(row.id || row._id || row.lineItemId || index),
  }))
  return { invoice, lineItems }
}

export async function getTrustLineItem(id) {
  const payload = await apiRequest(`/api/trust/line-items/${encodeURIComponent(id)}`)
  const record = root(payload)
  const item = record.lineItem && typeof record.lineItem === 'object' ? record.lineItem : record
  const transcriptSource = item.transcript || record.transcript || item.messages || []
  const transcript = (Array.isArray(transcriptSource) ? transcriptSource : [transcriptSource])
    .filter(Boolean)
    .map((entry, index) => {
      if (typeof entry !== 'object') {
        return { _key: String(index), message: String(entry), timestamp: '' }
      }
      return {
        _key: String(entry.id || index),
        message: entry.message || entry.text || entry.body || entry.content || '',
        timestamp: entry.timestamp || entry.eventAt || entry.createdAt || entry.time || '',
        eventType: entry.eventType || entry.event_type || entry.type || '',
      }
    })
  return { item, transcript }
}
