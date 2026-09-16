import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'
import { classifyLead } from '../../utils/pipeline'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function asTextList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item)).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function mapLeadIds(raw = {}) {
  const list = Array.isArray(raw.leadIds)
    ? raw.leadIds
    : Array.isArray(raw.leads)
      ? raw.leads
      : raw.leadId
        ? [raw.leadId]
        : []
  return list
    .map((item) =>
      typeof item === 'object'
        ? item.id || item.leadId || item._id || textValue(item)
        : String(item || ''),
    )
    .filter(Boolean)
}

function mapChannels(raw = {}) {
  const list = Array.isArray(raw.channels) ? raw.channels : asTextList(raw.channels)
  return list.map((item) => textValue(item)).filter(Boolean)
}

export function mapCustomerRow(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const leadIds = mapLeadIds(raw)
  return {
    id: raw.id || raw._id || raw.customerId || `cust_${index + 1}`,
    name: textValue(raw.name || raw.fullName || raw.customer, 'Unknown customer'),
    email: textValue(raw.email, '—'),
    phone: textValue(raw.phone, '—'),
    leadIds,
    crmId: textValue(raw.crmId || raw.crmID, '—'),
    channels: mapChannels(raw),
    dealership: textValue(raw.dealership || raw.dealershipName, '—'),
    lastActivity: textValue(
      raw.lastActivity,
      formatStamp(raw.lastActivityAt || raw.updatedAt || raw.lastSeenAt) || '—',
    ),
    status: textValue(raw.status, 'ACTIVE').toUpperCase(),
  }
}

function mapTimelineItem(row, index = 0) {
  if (!row) return null
  if (typeof row === 'string') {
    return { id: `ct_${index}`, event: row, detail: '', time: '—' }
  }
  return {
    id: row.id || row._id || `ct_${index}`,
    event: textValue(row.event || row.title || row.type, 'Event'),
    detail: textValue(row.detail || row.description || row.message),
    time: textValue(row.time, formatStamp(row.createdAt || row.timestamp || row.at) || '—'),
  }
}

function mapGenome(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const scores = raw.scores && typeof raw.scores === 'object' ? raw.scores : raw
  const traits = raw.traits && typeof raw.traits === 'object' ? raw.traits : {}
  const hasData =
    raw.intent != null ||
    raw.urgency != null ||
    scores.urgency != null ||
    raw.tone != null ||
    raw.preferredTone != null ||
    Object.keys(raw).length > 0
  if (!hasData) return null
  return {
    intent: textValue(raw.intent || raw.intentLevel || raw.badge, 'MEDIUM'),
    urgency: numberValue(scores.urgency, traits.urgency, raw.urgency),
    budgetSensitivity: numberValue(
      scores.budgetSensitivity,
      traits.budgetSensitivity,
      raw.budgetSensitivity,
    ),
    hesitation: numberValue(scores.hesitation, traits.hesitation, raw.hesitation),
    riskTolerance: numberValue(scores.riskTolerance, traits.riskTolerance, raw.riskTolerance),
    tone: textValue(raw.tone || raw.preferredTone || scores.tone, '—'),
    length: textValue(
      raw.length || raw.messageLength || raw.preferredMessageLength || scores.length,
      '—',
    ),
    timing: textValue(raw.timing || raw.bestReplyTiming || scores.timing, '—'),
  }
}

function mapSignal(row, index = 0) {
  if (!row || typeof row !== 'object') return null
  return {
    id: row.id || row._id || `sig_${index}`,
    period: textValue(row.period, index === 0 ? 'Current' : 'Prior'),
    dmOpens: numberValue(row.dmOpens, row.opens),
    dmReplies: numberValue(row.dmReplies, row.replies),
    averageReplyDelay: textValue(row.averageReplyDelay || row.replyDelay, '—'),
    storyViews: numberValue(row.storyViews),
    storyReplays: numberValue(row.storyReplays),
    contentSaves: numberValue(row.contentSaves, row.saves),
    returnVisits: numberValue(row.returnVisits),
    priceQuestions: numberValue(row.priceQuestions),
    vehicleInterest: textValue(row.vehicleInterest || row.vehicle, '—'),
  }
}

function mapSignals(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(mapSignal).filter(Boolean)
  if (typeof raw !== 'object') return []
  if (raw.current || raw.previous || raw.prior) {
    return [raw.current, raw.previous || raw.prior].map(mapSignal).filter(Boolean)
  }
  if (
    raw.dmOpens != null ||
    raw.dmReplies != null ||
    raw.storyViews != null ||
    raw.vehicleInterest != null
  ) {
    return [mapSignal({ ...raw, period: raw.period || 'Current' })].filter(Boolean)
  }
  return extractList(raw, ['signals', 'items', 'current']).map(mapSignal).filter(Boolean)
}

function mapLinkedLead(raw, index = 0) {
  if (!raw) return null
  const lead = typeof raw === 'object' ? raw : { id: raw }
  const id = lead.id || lead.leadId || lead._id
  if (!id && !lead.source && !lead.pipelineType) return null
  const classified = classifyLead({
    ...lead,
    id: id || `lead_${index + 1}`,
    source: textValue(lead.source || lead.leadSource),
    pipelineType: textValue(lead.pipelineType || lead.pipeline),
  })
  return classified
}

function mapDuplicates(raw) {
  const list = Array.isArray(raw)
    ? raw
    : extractList(raw || {}, ['duplicates', 'potentialDuplicates', 'matches', 'candidates'])
  return list
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: item, name: item, email: '—', phone: '—', autoFlowId: '', crmId: '—' }
      }
      const row = mapCustomerRow(item, index)
      if (!row) return null
      return {
        ...row,
        autoFlowId: textValue(item.autoFlowId || item.model31Id || item.customerId, row.id),
      }
    })
    .filter(Boolean)
}

function pickObject(payload, keys = []) {
  if (!payload || typeof payload !== 'object') return null
  for (const key of keys) {
    const value = payload[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) return value
  }
  return null
}

function mergeCustomerSource(payload) {
  const nested =
    pickObject(payload, ['customer', 'profile', 'identity', 'item']) ||
    extractItem(payload, ['customer', 'profile', 'identity', 'item'])
  const extra = nested && nested !== payload && typeof nested === 'object' ? nested : {}
  return { ...payload, ...extra }
}

export function mapCustomerDetail(payload) {
  const raw = mergeCustomerSource(payload)
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw._id || raw.customerId
  if (!id && !raw.name && !raw.email) return null

  const row = mapCustomerRow(raw)
  const leadObjects = extractList(raw, ['linkedLeads', 'leads', 'leadPipelines']).filter(
    (item) => item && typeof item === 'object',
  )
  const pipelineLead =
    raw.pipeline || raw.pipelineType || raw.source || raw.leadSource
      ? [
          {
            id: raw.leadId || row.leadIds[0],
            source: raw.source || raw.leadSource,
            pipelineType: raw.pipelineType || raw.pipeline,
          },
        ]
      : []

  const genomeRaw =
    raw.buyerGenome || raw.genome || payload?.buyerGenome || payload?.genome || null
  const signalsRaw =
    raw.behavioralSignals ||
    raw.behaviorSignals ||
    raw.signals ||
    payload?.behavioralSignals ||
    payload?.behaviorSignals ||
    payload?.signals

  return {
    ...row,
    id: id || row?.id,
    location: textValue(raw.location || raw.city, '—'),
    language: textValue(raw.language, '—'),
    autoFlowId: textValue(raw.autoFlowId || raw.model31Id || raw.model31CustomerId, id || '—'),
    crmId: textValue(raw.crmId || raw.crmID, '—'),
    linkedLeads: (leadObjects.length ? leadObjects : pipelineLead)
      .map(mapLinkedLead)
      .filter(Boolean),
    genome: mapGenome(genomeRaw),
    signals: mapSignals(signalsRaw),
    potentialDuplicates: mapDuplicates(
      raw.potentialDuplicates ||
        raw.duplicates ||
        payload?.potentialDuplicates ||
        payload?.duplicates,
    ),
    timeline: extractList(raw, ['timeline', 'activity', 'events'])
      .map(mapTimelineItem)
      .filter(Boolean),
  }
}

export function mapDuplicateReview(payload, fallbackId) {
  const raw = payload && typeof payload === 'object' ? payload : {}
  const currentRaw =
    pickObject(raw, ['customer', 'customerA', 'current', 'primary', 'recordA']) || raw
  const otherRaw = pickObject(raw, [
    'duplicate',
    'customerB',
    'match',
    'compare',
    'other',
    'recordB',
  ])
  const current = mapCustomerDetail(currentRaw)
  const duplicates = mapDuplicates(
    raw.duplicates || raw.matches || raw.candidates || raw.items || (otherRaw ? [otherRaw] : []),
  )
  const duplicate =
    duplicates.find((item) => item.id && item.id !== (current?.id || fallbackId)) ||
    (otherRaw ? mapCustomerDetail(otherRaw) : null) ||
    duplicates[0] ||
    null

  return {
    current: current?.id ? current : null,
    duplicate,
    duplicates,
  }
}

export async function getCustomerIdentities({ page = 1, limit = 8, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)

  const payload = await apiRequest(`/api/super-admin/customer-identity?${params.toString()}`)
  const items = extractList(payload, ['customers', 'items']).map(mapCustomerRow).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getCustomerIdentityById(id) {
  const payload = await apiRequest(`/api/super-admin/customer-identity/${id}`)
  return mapCustomerDetail(payload)
}

export async function getDuplicateReview(id) {
  const payload = await apiRequest(`/api/super-admin/customer-identity/${id}/duplicate-review`)
  return mapDuplicateReview(payload, id)
}

export async function mergeCustomerRecords(id, mergeWithCustomerId) {
  const payload = await apiRequest(`/api/super-admin/customer-identity/${id}/merge`, {
    method: 'POST',
    body: { mergeWithCustomerId },
  })
  return mapCustomerDetail(payload)
}
