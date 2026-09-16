import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function mapLifeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const leadLabel = textValue(raw.leadLabel) || null
  const leadId = textValue(raw.leadId) || null
  return {
    id: raw.id || raw._id,
    customerName: textValue(raw.customerName),
    lifeEvent: textValue(raw.lifeEvent || raw.eventType || raw.event),
    detectedFrom: textValue(raw.detectedFrom || raw.source),
    date: formatDate(raw.date || raw.detectedAt || raw.createdAt) || textValue(raw.date),
    vehicleNeed: textValue(raw.vehicleNeed),
    customerSignal: textValue(raw.customerSignal || raw.signal || raw.notes),
    intent: textValue(raw.intent || raw.intentLevel),
    status: textValue(raw.status) || 'NEW',
    leadLabel,
    leadId: leadLabel || leadId,
    leadLinked: Boolean(raw.leadLinked || leadLabel || leadId),
    dealership: textValue(raw.dealershipName || raw.dealership),
  }
}

export async function getLifeEvents({
  page = 1,
  limit = 8,
  search = '',
  eventType = '',
  status = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: String(search || ''),
    eventType: eventType && eventType !== 'all' ? eventType : '',
    status: status && status !== 'all' ? status : '',
  })
  const payload = await apiRequest(`/api/marketing/life-events?${params.toString()}`)
  const items = extractList(payload, ['items', 'lifeEvents', 'events'])
    .map(mapLifeEvent)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getLifeEvent(id) {
  const payload = await apiRequest(`/api/marketing/life-events/${id}`)
  return mapLifeEvent(extractItem(payload, ['lifeEvent', 'event', 'item']))
}

export async function dismissLifeEvent(id) {
  await apiRequest(`/api/marketing/life-events/${id}/dismiss`, { method: 'PATCH' })
  return true
}

export async function createLifeEventLead(id) {
  const payload = await apiRequest(`/api/marketing/life-events/${id}/create-mock-lead`, {
    method: 'POST',
  })
  const mapped = mapLifeEvent(extractItem(payload, ['lifeEvent', 'lead', 'item']))
  const leadLabel =
    mapped?.leadLabel ||
    textValue(payload.leadLabel || payload.data?.leadLabel || payload.lead?.id)
  return { item: mapped, leadLabel }
}

export async function getLifeEventLinkedLead(id) {
  const payload = await apiRequest(`/api/marketing/life-events/${id}/linked-lead`)
  const lead = payload.lead || payload.data?.lead || null
  const leadLabel =
    textValue(payload.leadLabel || lead?.leadLabel || lead?.id) ||
    textValue(payload.lifeEvent?.leadLabel)
  return {
    leadLabel: leadLabel || null,
    leadId: textValue(payload.leadId || lead?.id) || null,
    lead,
    lifeEvent: mapLifeEvent(payload.lifeEvent || payload.data?.lifeEvent),
  }
}

const marketingLifeEventService = {
  getLifeEvents,
  getLifeEvent,
  dismissLifeEvent,
  createLifeEventLead,
  getLifeEventLinkedLead,
}

export default marketingLifeEventService
