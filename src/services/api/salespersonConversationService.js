import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function mapConversation(raw) {
  if (!raw || typeof raw !== 'object') return null
  const lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  return {
    id: raw.leadId || raw.id || raw._id || lead.id,
    leadId: raw.leadId || lead.id || raw.id,
    customerName: textValue(raw.customerName || lead.customerName) || 'Lead',
    vehicle: textValue(raw.vehicle || lead.vehicle),
    budget: textValue(raw.budget || lead.budget),
    timeline: textValue(raw.timeline || lead.timeline),
    status: textValue(raw.status || lead.status),
  }
}

function mapMessage(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const sender = textValue(raw.senderType || raw.sender || raw.from || 'SALESPERSON')
  return {
    id: raw.id || raw._id || `msg_${index}`,
    sender: sender.toLowerCase(),
    text: textValue(raw.message || raw.text || raw.body),
    timestamp: formatStamp(raw.createdAt || raw.timestamp || raw.time),
  }
}

export async function getSalespersonConversations() {
  const payload = await apiRequest('/api/salesperson/conversations')
  return extractList(payload, ['conversations', 'leads']).map(mapConversation).filter(Boolean)
}

export async function getSalespersonConversation(leadId) {
  const payload = await apiRequest(`/api/salesperson/conversations/${leadId}`)
  const item = extractItem(payload, ['conversation', 'thread'])
  const messages = Array.isArray(item)
    ? item
    : item?.messages || item?.thread || payload?.messages || []
  return (Array.isArray(messages) ? messages : []).map(mapMessage).filter(Boolean)
}

export async function sendSalespersonMessage(leadId, message) {
  const payload = await apiRequest(`/api/salesperson/conversations/${leadId}/messages`, {
    method: 'POST',
    body: { message },
  })
  return mapMessage(extractItem(payload, ['message']) || payload) || true
}

const salespersonConversationService = {
  getSalespersonConversations,
  getSalespersonConversation,
  sendSalespersonMessage,
}

export default salespersonConversationService
