import { apiRequest } from './http'
import { classifyLead } from '../../utils/pipeline'
import {
  scoreToTier,
  breakdownFromScore,
  defaultTimeline,
  defaultActivity,
} from '../../data/leads'
import { textValue, formatStamp } from './payload'

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.leads)) return data.leads
  if (Array.isArray(payload?.leads)) return payload.leads
  if (Array.isArray(data?.items)) return data.items
  return []
}

function extractItem(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.id || payload._id || payload.customerName || payload.leadId) return payload
  const data = payload.data
  if (data && typeof data === 'object') {
    if (data.id || data._id || data.customerName || data.leadId) return data
    if (data.lead) return data.lead
  }
  return payload.lead || null
}

function extractPagination(payload, { page, limit, itemCount }) {
  const meta =
    payload?.pagination ||
    payload?.meta ||
    payload?.data?.pagination ||
    payload?.data?.meta ||
    (payload?.data && !Array.isArray(payload.data) ? payload.data : null) ||
    payload

  const total = Number(
    meta?.total ??
      meta?.totalItems ??
      meta?.totalCount ??
      payload?.total ??
      payload?.count ??
      itemCount,
  )
  const currentPage = Number(meta?.page ?? meta?.currentPage ?? page) || page
  const pageSize = Number(meta?.limit ?? meta?.pageSize ?? limit) || limit
  const totalPages = Number(
    meta?.totalPages ??
      meta?.pages ??
      Math.max(1, Math.ceil((total || 0) / pageSize)),
  )

  return {
    page: currentPage,
    limit: pageSize,
    total: Number.isFinite(total) ? total : itemCount,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

function extractStats(payload, pagination) {
  const raw = payload?.stats || payload?.data?.stats || payload?.summary || {}
  const pick = (...keys) => {
    for (const key of keys) {
      if (raw[key] != null && raw[key] !== '') return Number(raw[key]) || 0
    }
    return 0
  }

  return {
    totalLeads: pick('totalLeads', 'total') || pagination.total || 0,
    new: pick('new', 'NEW'),
    qualifying: pick('qualifying', 'QUALIFYING'),
    qualified: pick('qualified', 'QUALIFIED'),
    routed: pick('routed', 'ROUTED'),
    closed: pick('closed', 'CLOSED'),
  }
}

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

function mapTier(tier) {
  const match = String(tier || '').match(/[ABC]/i)
  return match ? match[0].toUpperCase() : ''
}

function mapPipeline(value) {
  const normalized = String(value || '')
    .toUpperCase()
    .replace(/[\s_-]+/g, '')
  if (normalized.includes('MODEL31')) return 'MODEL31'
  if (normalized.includes('DEALERSHIP')) return 'DEALERSHIP'
  return ''
}

function namedValue(value, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.name || value.fullName || fallback
}

function parseBudgetValue(budget) {
  const digits = String(budget || '').replace(/[^\d.]/g, '')
  return Number(digits) || 0
}

function asList(value) {
  return Array.isArray(value) ? value : null
}

function extractNotes(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.notes)) return data.notes
  if (Array.isArray(payload?.notes)) return payload.notes
  if (Array.isArray(data?.items)) return data.items
  return []
}

function mapNotes(rawNotes, leadId) {
  const notes = asList(rawNotes) || []
  return notes.map((note, index) => {
    if (typeof note === 'string') {
      return { id: `${leadId}-note-${index}`, text: note, author: '', time: '' }
    }
    return {
      id: note?.id || `${leadId}-note-${index}`,
      text: note?.text || note?.note || note?.body || '',
      author: namedValue(note?.author || note?.createdBy, 'System'),
      time: note?.time || formatDate(note?.createdAt || note?.at),
    }
  })
}

function mapTimelineEvents(raw, lead) {
  const source =
    asList(raw.timelineEvents) ||
    asList(raw.events) ||
    asList(raw.timeline)
  if (!source) return defaultTimeline(lead)
  return source.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `${lead.id}-evt-${index}`,
        label: item,
        description: '',
        time: '',
      }
    }
    return {
      id: item?.id || `${lead.id}-evt-${index}`,
      label: item?.label || item?.title || item?.event || item?.type || 'Event',
      description: item?.description || item?.detail || item?.message || '',
      time: item?.time || formatDate(item?.createdAt || item?.at),
    }
  })
}

function mapActivity(rawActivity, lead) {
  const source = asList(rawActivity)
  if (!source || source.length === 0) return defaultActivity(lead)
  return source.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `${lead.id}-act-${index}`,
        description: item,
        actor: 'System',
        time: '',
      }
    }
    return {
      id: item?.id || `${lead.id}-act-${index}`,
      description: item?.description || item?.event || item?.message || 'Activity',
      actor: namedValue(item?.actor || item?.user, 'System'),
      time: item?.time || formatDate(item?.createdAt || item?.at),
    }
  })
}

export function mapLead(raw) {
  if (!raw || typeof raw !== 'object') return null

  const score = Number(raw.score) || 0
  const createdAt = raw.createdAt || raw.created_at || raw.createdDate || ''
  const pipelineType = mapPipeline(raw.pipeline || raw.pipelineType)

  const lead = {
    id: raw.id || raw._id || raw.leadId,
    customerName: raw.customerName || raw.name || '',
    phone: raw.customerPhone || raw.phone || '',
    email: raw.customerEmail || raw.email || '',
    city: raw.city || raw.location || '',
    state: raw.state || '',
    language: raw.language || 'English',
    source: raw.source || '',
    vehicle: raw.vehicle || '',
    budget: raw.budget || '',
    budgetValue: Number(raw.budgetValue) || parseBudgetValue(raw.budget),
    timeline: typeof raw.timeline === 'string' ? raw.timeline : '',
    location: raw.location || raw.city || '',
    financing: raw.financing || '',
    score,
    tier: mapTier(raw.tier) || scoreToTier(score),
    status: raw.status || 'NEW',
    dealership: namedValue(raw.dealership, 'Unassigned'),
    dealershipId: raw.dealershipId || raw.dealership?.id || null,
    salesperson: namedValue(raw.salesperson, 'Unassigned') || 'Unassigned',
    salespersonId: raw.salespersonId || raw.salesperson?.id || null,
    createdAt,
    createdLabel: formatDate(createdAt),
    pipelineType,
    aiPaused: Boolean(raw.aiPaused),
    scoreBreakdown:
      raw.scoreBreakdown && typeof raw.scoreBreakdown === 'object' && !Array.isArray(raw.scoreBreakdown)
        ? raw.scoreBreakdown
        : breakdownFromScore(score),
  }

  const classified = classifyLead(lead)
  classified.notes = mapNotes(raw.notes, classified.id)
  classified.timelineEvents = mapTimelineEvents(raw, classified)
  classified.activity = mapActivity(raw.activity, classified)
  return classified
}

function toCreatePayload(form) {
  return {
    customerName: form.customerName?.trim(),
    customerPhone: (form.customerPhone || form.phone || '').trim(),
    customerEmail: (form.customerEmail || form.email || '').trim(),
    vehicle: (form.vehicle || '').trim(),
    budget: (form.budget || '').trim(),
    timeline: (form.timeline || '').trim(),
    location: (form.location || form.city || '').trim(),
    financing: (form.financing || '').trim(),
    score: Number(form.score) || 0,
    tier: form.tier || (form.score != null ? `Tier ${scoreToTier(Number(form.score))}` : undefined),
    status: form.status || 'NEW',
    dealershipId: form.dealershipId || undefined,
    source: form.source || 'Website',
    pipeline: form.pipeline || form.pipelineType || undefined,
  }
}

function toUpdatePayload(form) {
  return {
    customerName: form.customerName?.trim(),
    customerPhone: (form.phone || form.customerPhone || '').trim(),
    customerEmail: (form.email || form.customerEmail || '').trim(),
    vehicle: (form.vehicle || '').trim(),
    budget: (form.budget || '').trim(),
    timeline: (form.timeline || '').trim(),
    location: (form.location || '').trim(),
    financing: (form.financing || '').trim(),
    ...(form.score != null ? { score: Number(form.score) } : {}),
    ...(form.tier ? { tier: form.tier } : {}),
    ...(form.status ? { status: form.status } : {}),
  }
}

export async function getLeads({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)

  const payload = await apiRequest(`/api/leads?${params.toString()}`)
  const items = extractList(payload).map(mapLead).filter(Boolean)
  const pagination = extractPagination(payload, { page, limit, itemCount: items.length })
  return {
    items,
    stats: extractStats(payload, pagination),
    ...pagination,
  }
}

export async function getLeadStats() {
  const result = await getLeads({ page: 1, limit: 10 })
  return result.stats
}

export async function getLeadById(id) {
  try {
    const payload = await apiRequest(`/api/leads/${encodeURIComponent(id)}`)
    return mapLead(extractItem(payload))
  } catch (err) {
    const listed = await getLeads({ page: 1, limit: 100 }).catch(() => null)
    const found = listed?.items?.find((item) => String(item.id) === String(id))
    if (found) return found
    throw err
  }
}

export async function createLead(form) {
  const payload = await apiRequest('/api/leads', {
    method: 'POST',
    body: toCreatePayload(form),
  })
  return mapLead(extractItem(payload)) || true
}

export async function updateLead(id, form) {
  const payload = await apiRequest(`/api/leads/${id}`, {
    method: 'PUT',
    body: toUpdatePayload(form),
  })
  return mapLead(extractItem(payload)) || true
}

export async function updateLeadStatus(id, status) {
  const payload = await apiRequest(`/api/leads/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return mapLead(extractItem(payload)) || true
}

export async function assignLead(id, salesperson) {
  const salespersonId =
    salesperson == null
      ? null
      : typeof salesperson === 'string'
        ? salesperson
        : salesperson.id
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(id)}/assign`, {
    method: 'PATCH',
    body: { salespersonId },
  })
  return mapLead(extractItem(payload)) || true
}

export async function addLeadNote(leadId, note) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/notes`, {
    method: 'POST',
    body: { note },
  })
  const created = extractItem(payload)
  const mapped = mapNotes(
    Array.isArray(created) ? created : created ? [created] : extractNotes(payload),
    leadId,
  )
  return mapped[0] || true
}

export async function getLeadNotes(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/notes`)
  return mapNotes(extractNotes(payload), leadId)
}

function nestedData(payload, keys = []) {
  const data =
    payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? payload.data
      : payload
  if (!data || typeof data !== 'object') return null
  for (const key of keys) {
    if (data[key] && typeof data[key] === 'object') return data[key]
    if (payload?.[key] && typeof payload[key] === 'object') return payload[key]
  }
  return data
}

function mapConversationMessage(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const sender = textValue(raw.senderType || raw.sender || raw.from || 'customer')
  return {
    id: raw.id || raw._id || `msg_${index}`,
    sender: sender.toLowerCase(),
    text: textValue(raw.message || raw.text || raw.body),
    timestamp: formatStamp(raw.createdAt || raw.timestamp || raw.time) || textValue(raw.timestamp),
  }
}

function messagesFromPayload(payload) {
  const item = nestedData(payload, ['conversation', 'thread', 'item'])
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(item)
      ? item
      : item?.messages || item?.thread || payload?.messages || payload?.data?.messages || []
  return (Array.isArray(list) ? list : []).map(mapConversationMessage).filter(Boolean)
}

export async function getLeadConversation(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/conversation`)
  return messagesFromPayload(payload)
}

export async function sendLeadConversationMessage(leadId, text) {
  const payload = await apiRequest(
    `/api/leads/${encodeURIComponent(leadId)}/conversation/messages`,
    {
      method: 'POST',
      body: { text },
    },
  )
  const item = nestedData(payload, ['message', 'item'])
  const userMessage =
    mapConversationMessage(item?.message || item?.userMessage || item) ||
    messagesFromPayload(payload)[0] ||
    true
  const reply = mapConversationMessage(item?.reply || item?.aiMessage) || null
  const extra = messagesFromPayload(payload).slice(1)
  return { userMessage, reply, extra }
}

export async function getLeadGenome(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/genome`)
  const raw = nestedData(payload, ['genome', 'item'])
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  if (!raw.intent && raw.urgency == null && !raw.tone) return null
  return {
    leadId: raw.leadId || leadId,
    customerName: textValue(raw.customerName || raw.name),
    urgency: Number(raw.urgency) || 0,
    budgetSensitivity: Number(raw.budgetSensitivity) || 0,
    hesitation: Number(raw.hesitation) || 0,
    riskTolerance: Number(raw.riskTolerance) || 0,
    tone: textValue(raw.tone),
    length: textValue(raw.length || raw.preferredLength),
    timing: textValue(raw.timing || raw.bestReplyTiming),
    intent: textValue(raw.intent),
  }
}

export async function getLeadBehaviorSignals(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/behavior-signals`)
  const list = extractList(payload)
  if (list.length) {
    return list.map((row, index) => ({
      id: row.id || `sig_${index}`,
      leadId,
      period: textValue(row.period) || (index === 0 ? 'Current' : 'Prior'),
      dmOpens: Number(row.dmOpens) || 0,
      dmReplies: Number(row.dmReplies) || 0,
      averageReplyDelay: textValue(row.averageReplyDelay) || '—',
      storyViews: Number(row.storyViews) || 0,
      storyReplays: Number(row.storyReplays) || 0,
      contentSaves: Number(row.contentSaves) || 0,
      returnVisits: Number(row.returnVisits) || 0,
      priceQuestions: Number(row.priceQuestions) || 0,
      vehicleInterest: textValue(row.vehicleInterest),
    }))
  }
  const raw = extractItem(payload)
  if (!raw || typeof raw !== 'object') return []
  return [
    {
      id: raw.id || 'sig_current',
      leadId,
      period: textValue(raw.period) || 'Current',
      dmOpens: Number(raw.dmOpens) || 0,
      dmReplies: Number(raw.dmReplies) || 0,
      averageReplyDelay: textValue(raw.averageReplyDelay) || '—',
      storyViews: Number(raw.storyViews) || 0,
      storyReplays: Number(raw.storyReplays) || 0,
      contentSaves: Number(raw.contentSaves) || 0,
      returnVisits: Number(raw.returnVisits) || 0,
      priceQuestions: Number(raw.priceQuestions) || 0,
      vehicleInterest: textValue(raw.vehicleInterest),
    },
  ]
}

export async function getLeadVisualPackage(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/visual-package`)
  const raw = nestedData(payload, ['package', 'visualPackage', 'item'])
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  if (!raw.id && !raw._id && !raw.vin && !raw.vehicle && !raw.status) return null
  const images = Array.isArray(raw.images) ? raw.images : []
  return {
    id: raw.id || raw._id,
    leadId: raw.leadId || leadId,
    vin: textValue(raw.vin),
    vehicle: textValue(raw.vehicle),
    exterior: textValue(raw.exterior),
    interior: textValue(raw.interior),
    color: textValue(raw.color),
    trim: textValue(raw.trim),
    status: textValue(raw.status) || 'NOT AVAILABLE',
    video: textValue(raw.video),
    images,
  }
}

export async function getLeadHandoff(leadId) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/handoff`)
  const raw = nestedData(payload, ['handoff', 'item'])
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  if (!raw.id && !raw._id && !raw.dealStatus && !raw.vin && !raw.leadId) return null
  return {
    id: raw.id || raw._id,
    leadId: raw.leadId || leadId,
    vin: textValue(raw.vin),
    vehicle: textValue(raw.vehicle),
    dealStatus: textValue(raw.dealStatus || raw.status),
    ...raw,
  }
}

export async function getNegotiationLimitsForLead() {
  const payload = await apiRequest('/api/negotiation/limits')
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.limits)) return data.limits
  if (Array.isArray(data?.items)) return data.items
  return extractList(payload)
}

export async function setLeadAiPaused(leadId, paused) {
  const payload = await apiRequest(`/api/leads/${encodeURIComponent(leadId)}/ai-pause`, {
    method: 'PATCH',
    body: { paused: Boolean(paused) },
  })
  return extractItem(payload) || true
}

const leadService = {
  getLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  addLeadNote,
  getLeadNotes,
  getLeadConversation,
  sendLeadConversationMessage,
  getLeadGenome,
  getLeadBehaviorSignals,
  getLeadVisualPackage,
  getLeadHandoff,
  getNegotiationLimitsForLead,
  setLeadAiPaused,
}

export default leadService
