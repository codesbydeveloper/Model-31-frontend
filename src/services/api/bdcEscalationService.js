import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function mapEscalation(raw) {
  if (!raw || typeof raw !== 'object') return null
  const lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  const leadId = raw.leadId || lead.id || raw.id
  return {
    id: raw.id || raw._id || leadId,
    leadId,
    customerName: textValue(raw.customerName || lead.customerName),
    vehicle: textValue(raw.vehicle || lead.vehicle),
    reason: textValue(raw.reason) || 'Escalated',
    salesperson: textValue(raw.salesperson || lead.salesperson) || 'Unassigned',
    time: formatStamp(raw.time || raw.createdAt || raw.escalatedAt) || textValue(raw.time) || '—',
    priority: textValue(raw.priority) || 'HIGH',
    status: textValue(raw.status) || 'OPEN',
  }
}

export async function getBdcEscalations() {
  const payload = await apiRequest('/api/bdc/escalations')
  return extractList(payload, ['escalations', 'leads']).map(mapEscalation).filter(Boolean)
}

export async function resolveBdcEscalation(leadId) {
  const payload = await apiRequest(`/api/bdc/escalations/${leadId}/resolve`, {
    method: 'PATCH',
  })
  return mapEscalation(extractItem(payload, ['escalation'])) || true
}

const bdcEscalationService = {
  getBdcEscalations,
  resolveBdcEscalation,
}

export default bdcEscalationService
