import { apiRequest } from './http'
import { mapLead } from './leadService'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'

function mapBdcLead(raw) {
  const lead = mapLead(raw)
  if (!lead) return null
  return {
    ...lead,
    bdcStatus: textValue(raw.bdcStatus || raw.status) || lead.status,
    created: lead.createdLabel || formatStamp(raw.createdAt || raw.created) || textValue(raw.created),
    responseTime: textValue(raw.responseTime) || '—',
    waitTime: textValue(raw.waitTime) || '—',
    waitSeconds: Number(raw.waitSeconds) || 0,
    priority: textValue(raw.priority) || (lead.tier === 'A' ? 'HIGH' : lead.tier === 'B' ? 'MEDIUM' : 'LOW'),
    location: textValue(raw.location || raw.city) || lead.city,
  }
}

function mapSalesperson(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.salespersonId,
    name: textValue(raw.name || raw.fullName),
    email: textValue(raw.email),
    status: textValue(raw.status || raw.presence) || 'OFFLINE',
    dealership: textValue(raw.dealership),
    currentLeads: Number(raw.currentLeads ?? raw.assigned ?? 0) || 0,
    assigned: Number(raw.assigned ?? raw.assignedLeads ?? 0) || 0,
    accepted: Number(raw.accepted ?? raw.acceptedLeads ?? 0) || 0,
    declined: Number(raw.declined ?? 0) || 0,
    expired: Number(raw.expired ?? 0) || 0,
    appointments: Number(raw.appointments ?? 0) || 0,
    sold: Number(raw.sold ?? raw.soldDeals ?? 0) || 0,
    responseTime: textValue(raw.responseTime) || '—',
  }
}

export async function getBdcLeads({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (status && status !== 'all') params.set('status', status)

  const payload = await apiRequest(`/api/bdc/leads?${params.toString()}`)
  const items = extractList(payload, ['leads']).map(mapBdcLead).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getBdcLead(id) {
  const payload = await apiRequest(`/api/bdc/leads/${id}`)
  return mapBdcLead(extractItem(payload, ['lead']))
}

export async function assignBdcLead(id, salespersonId) {
  const payload = await apiRequest(`/api/bdc/leads/${id}/assign`, {
    method: 'PATCH',
    body: { salespersonId },
  })
  return mapBdcLead(extractItem(payload, ['lead'])) || true
}

export async function reassignBdcLead(id, salespersonId) {
  const payload = await apiRequest(`/api/bdc/leads/${id}/reassign`, {
    method: 'PATCH',
    body: { salespersonId },
  })
  return mapBdcLead(extractItem(payload, ['lead'])) || true
}

export async function escalateBdcLead(id, { reason = 'No response', priority = 'HIGH' } = {}) {
  const payload = await apiRequest(`/api/bdc/leads/${id}/escalate`, {
    method: 'PATCH',
    body: { reason, priority },
  })
  return mapBdcLead(extractItem(payload, ['lead'])) || true
}

export async function getBdcSalespeople() {
  const payload = await apiRequest('/api/bdc/salespeople')
  return extractList(payload, ['salespeople', 'users']).map(mapSalesperson).filter(Boolean)
}

export async function getBdcQueue({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/bdc/queue?${params.toString()}`)
  const items = extractList(payload, ['queue', 'leads']).map(mapBdcLead).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

const bdcLeadService = {
  getBdcLeads,
  getBdcLead,
  assignBdcLead,
  reassignBdcLead,
  escalateBdcLead,
  getBdcSalespeople,
  getBdcQueue,
}

export default bdcLeadService
