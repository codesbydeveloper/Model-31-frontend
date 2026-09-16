import { apiRequest } from './http'
import { extractList, extractItem, extractPagination } from './payload'
import { mapSoldDeal } from './salespersonPortalService'

export async function getSalespersonSoldDeals({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/salesperson/sold-deals?${params.toString()}`)
  const items = extractList(payload, ['deals', 'soldDeals']).map(mapSoldDeal).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getSalespersonSoldDeal(id) {
  const payload = await apiRequest(`/api/salesperson/sold-deals/${id}`)
  return mapSoldDeal(extractItem(payload, ['deal', 'soldDeal']))
}

const salespersonSoldDealService = {
  getSalespersonSoldDeals,
  getSalespersonSoldDeal,
}

export default salespersonSoldDealService
