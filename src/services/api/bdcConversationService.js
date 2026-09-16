import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function mapConversation(raw) {
  if (!raw || typeof raw !== 'object') return null
  const lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  return {
    id: raw.leadId || raw.id || raw._id || lead.id,
    leadId: raw.leadId || lead.id || raw.id,
    customerName:
      textValue(raw.customerName) ||
      textValue(lead.customerName) ||
      textValue(lead.name) ||
      'Lead',
    vehicle: textValue(raw.vehicle || lead.vehicle),
    score: Number(raw.score ?? lead.score) || 0,
    tier: textValue(raw.tier || lead.tier),
    status: textValue(raw.status || raw.bdcStatus || lead.status),
    bdcStatus: textValue(raw.bdcStatus || raw.status || lead.status),
    salesperson: textValue(raw.salesperson || lead.salesperson) || 'Unassigned',
  }
}

function mapMessage(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const sender = textValue(raw.senderType || raw.sender || raw.from || 'STAFF')
  return {
    id: raw.id || raw._id || `msg_${index}`,
    sender: sender.toLowerCase(),
    senderType: sender,
    text: textValue(raw.message || raw.text || raw.body),
    timestamp: formatStamp(raw.createdAt || raw.timestamp || raw.time),
  }
}

export async function getBdcConversations() {
  const payload = await apiRequest('/api/bdc/conversations')
  return extractList(payload, ['conversations', 'leads']).map(mapConversation).filter(Boolean)
}

export async function getBdcConversation(leadId) {
  const payload = await apiRequest(`/api/bdc/conversations/${leadId}`)
  const item = extractItem(payload, ['conversation', 'thread'])
  const messages = Array.isArray(item)
    ? item
    : item?.messages || item?.thread || payload?.messages || []
  return (Array.isArray(messages) ? messages : []).map(mapMessage).filter(Boolean)
}

export async function sendBdcMessage(leadId, { senderType = 'STAFF', message }) {
  const payload = await apiRequest(`/api/bdc/conversations/${leadId}/messages`, {
    method: 'POST',
    body: { senderType, message },
  })
  return mapMessage(extractItem(payload, ['message']) || payload) || true
}

const bdcConversationService = {
  getBdcConversations,
  getBdcConversation,
  sendBdcMessage,
}

export default bdcConversationService
