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
    lastMessage: textValue(raw.lastMessage || raw.preview || raw.message),
  }
}

function mapMessage(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const sender = textValue(raw.senderType || raw.sender || raw.from || 'AI')
  return {
    id: raw.id || raw._id || `msg_${index}`,
    sender,
    senderType: sender,
    text: textValue(raw.message || raw.text || raw.body),
    timestamp: formatStamp(raw.createdAt || raw.timestamp || raw.time),
  }
}

export async function getDealershipConversations() {
  const payload = await apiRequest('/api/dealership/conversations')
  return extractList(payload, ['conversations', 'leads'])
    .map(mapConversation)
    .filter(Boolean)
}

export async function getDealershipConversation(leadId) {
  const payload = await apiRequest(`/api/dealership/conversations/${leadId}`)
  const item = extractItem(payload, ['conversation', 'thread'])
  const messages = Array.isArray(item)
    ? item
    : item?.messages || item?.thread || payload?.messages || []
  return (Array.isArray(messages) ? messages : []).map(mapMessage).filter(Boolean)
}

export async function sendDealershipMessage(leadId, { senderType = 'AI', message }) {
  const payload = await apiRequest(`/api/dealership/conversations/${leadId}/messages`, {
    method: 'POST',
    body: { senderType, message },
  })
  return mapMessage(extractItem(payload, ['message']) || payload) || true
}

const dealershipConversationService = {
  getDealershipConversations,
  getDealershipConversation,
  sendDealershipMessage,
}

export default dealershipConversationService
