import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'
import { HANDOFF_STATUSES, handoffWorkflow } from '../../data/dealHandoffs'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function asOptions(raw, fallback, allLabel) {
  const items = (Array.isArray(raw) ? raw : fallback)
    .map((item) => textValue(item))
    .filter(Boolean)
  const source = items.length ? items : fallback
  const rest = source.filter((item) => !String(item).toLowerCase().startsWith('all '))
  const all = source.find((item) => String(item).toLowerCase().startsWith('all ')) || allLabel
  return [{ value: '', label: all }, ...rest.map((item) => ({ value: item, label: item }))]
}

function nuclearLabel(value) {
  if (value === true || value === 1) return 'ON'
  if (value === false || value === 0) return 'OFF'
  const text = String(value || '').trim().toUpperCase()
  if (text === 'ON' || text === 'TRUE' || text === 'ENABLED') return 'ON'
  if (text === 'OFF' || text === 'FALSE' || text === 'DISABLED' || !text) return 'OFF'
  return text
}

function parseRange(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      min: numberValue(value.min, value.minimum),
      max: numberValue(value.max, value.maximum),
    }
  }
  if (typeof value !== 'string') return { min: 0, max: 0 }
  const nums = value.match(/[\d,]+(?:\.\d+)?/g) || []
  return {
    min: numberValue(nums[0]),
    max: numberValue(nums[1]),
  }
}

function isHandoffRecord(raw) {
  return Boolean(
    raw &&
      (raw.id ||
        raw._id ||
        raw.handoffId ||
        raw.customerName ||
        raw.customer ||
        raw.vehicle ||
        raw.leadId),
  )
}

function mapImages(raw) {
  const list = Array.isArray(raw) ? raw : extractList(raw || {}, ['images', 'photos', 'views'])
  return list
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: `img_${index}`, label: item, url: '' }
      }
      if (!item || typeof item !== 'object') return null
      return {
        id: item.id || item._id || `img_${index}`,
        label: textValue(item.label || item.name || item.title || item.view, `Image ${index + 1}`),
        url: textValue(item.url || item.src || item.image || item.thumbnail),
      }
    })
    .filter(Boolean)
}

function formatVideo(raw = {}) {
  const label = textValue(
    raw.video || raw.videoLabel || raw.walkaround || raw.walkaroundVideo,
  )
  const duration = textValue(raw.duration || raw.videoDuration || raw.length)
  if (label && duration && !label.includes(duration)) return `${label} (${duration})`
  if (label) return label
  if (duration) return `Walkaround video (${duration})`
  return ''
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
    raw.preferredTone != null
  if (!hasData) return null
  return {
    intent: textValue(raw.intent || raw.intentLevel, 'MEDIUM'),
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

function mapLimits(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const payment = parseRange(raw.payment)
  const trade = parseRange(raw.trade)
  const minPrice = numberValue(raw.minimumPrice, raw.minPrice)
  const maxDiscount = numberValue(raw.maximumDiscount, raw.maxDiscount)
  const hasData =
    minPrice ||
    maxDiscount ||
    payment.min ||
    payment.max ||
    raw.template ||
    raw.minimumPayment != null
  if (!hasData) return null
  return {
    minPrice,
    maxDiscount,
    paymentMin: numberValue(raw.minimumPayment, raw.paymentMin, payment.min),
    paymentMax: numberValue(raw.maximumPayment, raw.paymentMax, payment.max),
    tradeMin: numberValue(raw.minimumTradeValue, raw.tradeMin, trade.min),
    tradeMax: numberValue(raw.maximumTradeValue, raw.tradeMax, trade.max),
    template: textValue(raw.template || raw.templateName, '—'),
  }
}

function mapVisualPackage(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const images = mapImages(raw.images || raw.views || raw.photos || raw.media)
  const video = formatVideo(raw)
  const hasData =
    raw.vehicle ||
    raw.status ||
    raw.exterior ||
    raw.interior ||
    images.length ||
    video
  if (!hasData) return null
  return {
    vehicle: textValue(raw.vehicle),
    exterior: textValue(raw.exterior),
    interior: textValue(raw.interior),
    color: textValue(raw.color),
    trim: textValue(raw.trim),
    status: textValue(raw.status, 'READY').toUpperCase(),
    images,
    video,
  }
}

function mapFlowSteps(raw) {
  const list = Array.isArray(raw) ? raw : extractList(raw || {}, ['steps', 'flowSteps'])
  if (!list.length) {
    return handoffWorkflow.map((step) => ({ step, detail: '' }))
  }
  return list
    .map((item, index) => {
      if (typeof item === 'string') return { step: item, detail: '' }
      if (!item || typeof item !== 'object') return null
      return {
        step: textValue(item.step || item.title || item.label, `Step ${index + 1}`),
        detail: textValue(item.detail || item.description || item.message),
      }
    })
    .filter(Boolean)
}

const DEFAULT_ACTIONS = [
  { key: 'accept-handoff', label: 'Accept Handoff', variant: 'primary' },
  { key: 'request-more-info', label: 'Request More Information', variant: 'secondary' },
  { key: 'take-over', label: 'Take Over', variant: 'secondary' },
  { key: 'mark-closed', label: 'Mark Closed', variant: 'ghost' },
  { key: 'open-lead', label: 'Open Lead', variant: 'ghost' },
]

function actionKey(item) {
  return textValue(item?.key || item?.id || item?.action || item?.endpoint)
    .toLowerCase()
    .replace(/_/g, '-')
}

function mapActions(raw) {
  const list = Array.isArray(raw) ? raw : extractList(raw || {}, ['actions', 'actionButtons', 'buttons'])
  const byKey = {}
  list.forEach((item) => {
    if (typeof item === 'string') {
      byKey[item.toLowerCase().replace(/_/g, '-')] = { enabled: true, label: '' }
      return
    }
    if (!item || typeof item !== 'object') return
    byKey[actionKey(item)] = {
      enabled: item.enabled !== false && item.disabled !== true,
      label: textValue(item.label || item.name),
    }
  })
  return DEFAULT_ACTIONS.map((action) => {
    const match = byKey[action.key] || byKey[action.key.replace(/-/g, '')]
    return {
      ...action,
      enabled: match ? match.enabled : true,
      label: match?.label || action.label,
    }
  })
}

export function mapHandoff(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const customer = raw.customer && typeof raw.customer === 'object' ? raw.customer : null
  return {
    id: raw.id || raw._id || raw.handoffId || `dh_${String(index + 1).padStart(3, '0')}`,
    leadId: raw.leadId || raw.lead?._id || raw.lead?.id || '',
    customerName: textValue(
      raw.customerName || customer?.name || customer?.fullName || raw.customer,
      'Unknown',
    ),
    vehicle: textValue(raw.vehicle || raw.vehicleName, '—'),
    vin: textValue(raw.vin),
    score: numberValue(raw.leadScore, raw.score),
    intent: textValue(raw.intent, 'MEDIUM').toUpperCase(),
    nuclearMode: nuclearLabel(raw.nuclearMode ?? raw.nuclearOn ?? raw.nuclear),
    dealStatus: textValue(raw.dealStatus || raw.status, 'QUALIFIED').toUpperCase(),
    salesperson: textValue(raw.salesperson || raw.salespersonName, 'Unassigned'),
    handoffTime:
      textValue(raw.handoffTime) ||
      formatStamp(raw.handoffAt || raw.createdAt || raw.updatedAt) ||
      '—',
    priority: textValue(raw.priority, 'MEDIUM').toUpperCase(),
  }
}

export function mapDealHandoffDetail(payload) {
  const raw = extractItem(payload, ['handoff', 'record', 'item', 'dealHandoff']) || payload
  if (!isHandoffRecord(raw)) return null
  const mapped = mapHandoff(raw)
  if (!mapped) return null
  const details = raw.dealDetails && typeof raw.dealDetails === 'object' ? raw.dealDetails : raw
  const genomeRaw =
    raw.buyerGenome || raw.genome || payload?.buyerGenome || payload?.genome || null
  const limitsRaw =
    raw.negotiationLimits ||
    raw.limits ||
    payload?.negotiationLimits ||
    payload?.limits ||
    null
  const buyOnlineRaw = raw.buyOnline || payload?.buyOnline || null
  const packRaw =
    raw.visualPackage ||
    raw.visualPackageSummary ||
    payload?.visualPackage ||
    payload?.visualPackageSummary ||
    null
  const flowRaw =
    raw.flowSteps ||
    raw.flow ||
    payload?.flowSteps ||
    payload?.handoffWorkflow ||
    payload?.flow ||
    null
  const actionsRaw = raw.actions || raw.actionButtons || payload?.actions || payload?.actionButtons
  const staffFlow = raw.staffFlow || payload?.staffFlow || null

  const buyOnlineAvailable =
    typeof buyOnlineRaw === 'object' && buyOnlineRaw
      ? buyOnlineRaw.available === true || buyOnlineRaw.enabled === true
      : mapped.nuclearMode === 'ON' &&
        mapped.intent === 'HIGH' &&
        mapped.dealStatus === 'DEAL READY'

  return {
    ...mapped,
    budget: textValue(details.budget || raw.budget),
    paymentPreference: textValue(
      details.paymentPreference || details.payment || raw.paymentPreference,
    ),
    trade: textValue(details.trade || details.tradeInformation || raw.trade),
    appointment: textValue(details.appointment || raw.appointment),
    conversationSummary: textValue(
      details.conversationSummary || raw.conversationSummary || raw.summary,
    ),
    staffSocial: Boolean(raw.staffSocial || staffFlow),
    staffFlow: staffFlow && typeof staffFlow === 'object' ? staffFlow : null,
    genome: mapGenome(genomeRaw),
    limits: mapLimits(limitsRaw),
    buyOnline: {
      available: buyOnlineAvailable,
      vehicle: textValue(buyOnlineRaw?.vehicle, mapped.vehicle),
      dealStatus: textValue(buyOnlineRaw?.dealStatus, mapped.dealStatus),
      nuclearOn: mapped.nuclearMode === 'ON',
    },
    visualPackage: mapVisualPackage(packRaw),
    flowSteps: mapFlowSteps(flowRaw),
    actions: mapActions(actionsRaw),
    workflowNote: textValue(
      raw.workflowNote || payload?.workflowNote || payload?.note,
      'Model 31 does not automatically mark a deal as sold.',
    ),
  }
}

export const EMPTY_HANDOFF_PAGE = {
  pageTitle: 'Deal Handoffs',
  description: 'Review qualified buyers and structured deals requiring management attention.',
  options: {
    statuses: asOptions(HANDOFF_STATUSES, HANDOFF_STATUSES, 'All statuses'),
  },
  items: [],
  total: 0,
}

export async function getDealHandoffs({ search = '', status = '', page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)
  const statusValue = String(status || '').trim()
  if (statusValue && !statusValue.toLowerCase().startsWith('all ')) {
    params.set('status', statusValue)
  }

  const payload = await apiRequest(`/api/super-admin/deal-handoffs?${params.toString()}`)
  const items = extractList(payload, ['rows', 'items', 'handoffs'])
    .map(mapHandoff)
    .filter(Boolean)
  const options = payload.options || {}

  return {
    pageTitle: textValue(payload.pageTitle, EMPTY_HANDOFF_PAGE.pageTitle),
    description: textValue(payload.description, EMPTY_HANDOFF_PAGE.description),
    options: {
      statuses: asOptions(options.statuses, HANDOFF_STATUSES, 'All statuses'),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getDealHandoff(id) {
  const payload = await apiRequest(
    `/api/super-admin/deal-handoffs/${encodeURIComponent(id)}`,
  )
  return mapDealHandoffDetail(payload)
}

export async function getDealHandoffVisualPackage(id) {
  const payload = await apiRequest(
    `/api/super-admin/deal-handoffs/${encodeURIComponent(id)}/visual-package`,
  )
  const raw =
    extractItem(payload, ['visualPackage', 'package', 'item', 'media']) || payload
  return (
    mapVisualPackage(raw) || {
      vehicle: textValue(payload.vehicle),
      status: textValue(payload.status, 'READY').toUpperCase(),
      exterior: '',
      interior: '',
      color: '',
      trim: '',
      images: mapImages(payload.images || payload.views || payload.photos),
      video: formatVideo(payload),
    }
  )
}

async function postHandoffAction(id, path, body) {
  const payload = await apiRequest(
    `/api/super-admin/deal-handoffs/${encodeURIComponent(id)}/${path}`,
    {
      method: 'POST',
      ...(body !== undefined ? { body } : {}),
    },
  )
  return {
    message: textValue(payload?.message, 'Done.'),
    handoff: isHandoffRecord(
      extractItem(payload, ['handoff', 'record', 'item', 'dealHandoff']),
    )
      ? mapDealHandoffDetail(payload)
      : null,
  }
}

export async function acceptDealHandoff(id) {
  return postHandoffAction(id, 'accept-handoff')
}

export async function requestDealHandoffInfo(id, note) {
  return postHandoffAction(id, 'request-more-info', { note: String(note || '').trim() })
}

export async function takeOverDealHandoff(id) {
  return postHandoffAction(id, 'take-over')
}

export async function markDealHandoffClosed(id) {
  return postHandoffAction(id, 'mark-closed')
}

export async function openDealHandoffLead(id) {
  const payload = await apiRequest(
    `/api/super-admin/deal-handoffs/${encodeURIComponent(id)}/open-lead`,
  )
  const nestedLead = payload.lead && typeof payload.lead === 'object' ? payload.lead : null
  const raw = extractItem(payload, ['lead', 'item']) || payload
  const leadId = textValue(
    payload.leadId ||
      nestedLead?.id ||
      nestedLead?._id ||
      nestedLead?.leadId ||
      raw.leadId ||
      payload.redirectId,
  )
  const path = textValue(payload.path || payload.redirectTo || payload.url)
  if (path && path.startsWith('/')) {
    return { path, leadId, message: textValue(payload.message) }
  }
  if (leadId) {
    return {
      path: `/super-admin/leads/${leadId}`,
      leadId,
      message: textValue(payload.message),
    }
  }
  throw new Error('Lead is not available for this handoff.')
}
