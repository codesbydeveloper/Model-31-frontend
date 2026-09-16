import { apiRequest } from './http'
import { extractList, textValue } from './payload'

function mapTeamMember(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.salespersonId,
    name: textValue(raw.name || raw.fullName),
    status: textValue(raw.status) || 'OFFLINE',
    assigned: Number(raw.assigned ?? raw.assignedLeads ?? 0) || 0,
    accepted: Number(raw.accepted ?? raw.acceptedLeads ?? 0) || 0,
    declined: Number(raw.declined ?? 0) || 0,
    expired: Number(raw.expired ?? 0) || 0,
    appointments: Number(raw.appointments ?? 0) || 0,
    sold: Number(raw.sold ?? raw.soldDeals ?? 0) || 0,
    responseTime: textValue(raw.responseTime) || '—',
  }
}

export async function getBdcTeam({ sort = 'name' } = {}) {
  const params = new URLSearchParams()
  if (sort) params.set('sort', sort)
  const query = params.toString()
  const payload = await apiRequest(`/api/bdc/team${query ? `?${query}` : ''}`)
  return extractList(payload, ['team', 'salespeople', 'members'])
    .map(mapTeamMember)
    .filter(Boolean)
}

const bdcTeamService = {
  getBdcTeam,
}

export default bdcTeamService
