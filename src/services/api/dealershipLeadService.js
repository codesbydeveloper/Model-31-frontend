import { apiRequest } from './http'
import { mapLead } from './leadService'
import { extractList, extractItem, extractPagination } from './payload'

export async function getDealershipLeads({
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

  const payload = await apiRequest(`/api/dealership/leads?${params.toString()}`)
  const items = extractList(payload, ['leads']).map(mapLead).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getDealershipLead(id) {
  const payload = await apiRequest(`/api/dealership/leads/${id}`)
  return mapLead(extractItem(payload, ['lead']))
}

export async function updateDealershipLeadStatus(id, status) {
  const payload = await apiRequest(`/api/dealership/leads/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return mapLead(extractItem(payload, ['lead'])) || true
}

export async function assignDealershipLead(id, salespersonId) {
  const payload = await apiRequest(`/api/dealership/leads/${id}/assign`, {
    method: 'PATCH',
    body: { salespersonId: salespersonId || null },
  })
  return mapLead(extractItem(payload, ['lead'])) || true
}

const dealershipLeadService = {
  getDealershipLeads,
  getDealershipLead,
  updateDealershipLeadStatus,
  assignDealershipLead,
}

export default dealershipLeadService
