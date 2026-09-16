import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
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

export function mapEngagement(raw, activity = []) {
  if (!raw || typeof raw !== 'object') return null
  const timelineSource = Array.isArray(activity) && activity.length
    ? activity
    : raw.activity || raw.timeline || []

  return {
    id: raw.id || raw._id || raw.engagementId,
    customerName: textValue(raw.customerName),
    persona: textValue(raw.persona),
    platform: textValue(raw.platform),
    dealership: textValue(raw.dealershipName || raw.dealership),
    likes: numberValue(raw.likes),
    comments: numberValue(raw.comments),
    shares: numberValue(raw.shares),
    saves: numberValue(raw.saves),
    dmInteractions: numberValue(raw.dms, raw.dmInteractions),
    storyInteractions: numberValue(raw.stories, raw.storyInteractions),
    returnVisits: numberValue(raw.returns, raw.returnVisits),
    engagementLevel: textValue(raw.level || raw.engagementLevel) || 'LOW',
    lastActivity: formatDate(raw.lastActivity) || textValue(raw.lastActivity),
    firstInteraction: formatDate(raw.firstInteraction) || textValue(raw.firstInteraction),
    lastInteraction: formatDate(raw.lastInteraction || raw.lastActivity),
    totalInteractions: numberValue(raw.totalInteractions),
    leadId: textValue(raw.leadLabel || raw.leadId) || null,
    potentialLead: Boolean(raw.potentialLead || raw.leadLabel || raw.leadId),
    signals: raw.signals && typeof raw.signals === 'object' ? raw.signals : null,
    dmBehavior: {
      opens: numberValue(raw.dmOpens, raw.dmBehavior?.opens),
      replies: numberValue(raw.dmReplies, raw.dmBehavior?.replies),
      repeatOpens: numberValue(raw.repeatOpens, raw.dmBehavior?.repeatOpens),
      conversationReturns: numberValue(
        raw.conversationReturns,
        raw.dmBehavior?.conversationReturns,
      ),
      responseTime: textValue(raw.responseTime || raw.dmBehavior?.responseTime),
      engagementLevel: textValue(
        raw.dmBehavior?.engagementLevel || raw.level || raw.engagementLevel,
      ),
    },
    timeline: extractList(timelineSource).map((event, index) => ({
      id: event.id || `evt_${index}`,
      type: textValue(event.actionType || event.type),
      detail: textValue(event.detail || event.message),
      time: formatStamp(event.createdAt || event.time) || textValue(event.time),
    })),
  }
}

export async function getMarketingEngagement({ page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/marketing/engagement?${params.toString()}`)
  const stats = payload.stats || payload.data?.stats || {}
  const items = extractList(payload, ['items', 'engagement', 'records'])
    .map((row) => mapEngagement(row))
    .filter(Boolean)

  return {
    stats: {
      dmOpens: numberValue(stats.dmOpens),
      dmReplies: numberValue(stats.dmReplies),
      repeatOpens: numberValue(stats.repeatOpens),
      conversationReturns: numberValue(stats.conversationReturns),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

function mapStoryInteraction(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `story_${index}`,
    customerName: textValue(raw.customerName),
    story: textValue(raw.story || raw.storyName || raw.title),
    platform: textValue(raw.platform),
    interaction: textValue(raw.interaction || raw.interactionType || raw.action),
    date: formatDate(raw.date || raw.createdAt) || textValue(raw.date),
    intent: textValue(raw.intent),
    status: textValue(raw.status),
  }
}

function mapReturningVisitor(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `ret_${index}`,
    customerName: textValue(raw.customerName),
    firstVisit: formatDate(raw.firstVisit) || textValue(raw.firstVisit),
    latestVisit: formatDate(raw.latestVisit || raw.lastVisit) || textValue(raw.latestVisit),
    visitCount: numberValue(raw.visitCount, raw.visits, raw.returns),
    lastInteraction: textValue(raw.lastInteraction),
    engagementLevel: textValue(raw.engagementLevel || raw.engagement || raw.level),
    potentialIntent: textValue(raw.potentialIntent || raw.intent),
  }
}

export async function getStoryInteractions({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(
    `/api/marketing/engagement/story-interactions?${params.toString()}`,
  )
  const items = extractList(payload, ['items', 'stories', 'storyInteractions'])
    .map((row, index) => mapStoryInteraction(row, index))
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getReturningVisitors({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(
    `/api/marketing/engagement/returning-visitors?${params.toString()}`,
  )
  const items = extractList(payload, ['items', 'returningVisitors', 'visitors'])
    .map((row, index) => mapReturningVisitor(row, index))
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getMarketingEngagementById(id) {
  const payload = await apiRequest(`/api/marketing/engagement/${id}`)
  const raw = extractItem(payload, ['engagement', 'record', 'item'])
  const activity = extractList(payload, ['activity', 'timeline'])
  const mapped = mapEngagement(raw, activity)
  return mapped?.id ? mapped : null
}

const marketingEngagementService = {
  getMarketingEngagement,
  getMarketingEngagementById,
  getStoryInteractions,
  getReturningVisitors,
}

export default marketingEngagementService
