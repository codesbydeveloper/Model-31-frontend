import { apiRequest } from './http'
import { extractList, extractPagination, textValue } from './payload'

function mapSalesperson(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.salespersonId,
    name: textValue(raw.name || raw.fullName),
    email: textValue(raw.email),
    status: textValue(raw.status || raw.presence) || 'OFFLINE',
    assigned: Number(raw.assigned ?? raw.assignedLeads ?? raw.currentLeads ?? 0) || 0,
    sold: Number(raw.sold ?? raw.soldDeals ?? 0) || 0,
    dealership: textValue(raw.dealership),
    currentLeads: Number(raw.currentLeads ?? raw.assigned ?? 0) || 0,
  }
}

export async function getDealershipSalespeople({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/dealership/salespeople?${params.toString()}`)
  const items = extractList(payload, ['salespeople', 'users'])
    .map(mapSalesperson)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

const dealershipSalespersonService = {
  getDealershipSalespeople,
}

export default dealershipSalespersonService
