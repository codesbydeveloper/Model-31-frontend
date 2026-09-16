import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function formatActivityDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function mapStep(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `step_${index}`,
    day: numberValue(raw.day),
    channel: textValue(raw.channel),
    message: textValue(raw.message),
    status: textValue(raw.status) || 'ACTIVE',
    order: numberValue(raw.order, index + 1),
  }
}

function mapActivity(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `fua_${index}`,
    label: textValue(raw.activityType || raw.label || raw.type),
    detail: textValue(raw.detail || raw.message),
    time: formatActivityDate(raw.createdAt || raw.time) || textValue(raw.time),
  }
}

export function mapFollowUp(raw) {
  if (!raw || typeof raw !== 'object') return null
  const metrics = raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : {}
  const stepRows = Array.isArray(raw.steps) ? raw.steps.map(mapStep).filter(Boolean) : []
  const stepCount = Array.isArray(raw.steps)
    ? stepRows.length
    : numberValue(raw.steps, raw.stepCount, metrics.steps)

  return {
    id: raw.id || raw._id,
    name: textValue(raw.name || raw.sequence),
    description: textValue(raw.description),
    targetAudience: textValue(raw.targetAudience || raw.audience),
    audience: textValue(raw.targetAudience || raw.audience),
    trigger: textValue(raw.trigger),
    status: textValue(raw.status) || 'DRAFT',
    steps: stepRows,
    stepCount,
    activeLeads: numberValue(raw.activeLeads, metrics.activeLeads),
    completed: numberValue(raw.completed, metrics.completed),
    conversion: numberValue(raw.conversion, metrics.conversion),
    activity: extractList(raw.activityLog || raw.activity).map(mapActivity).filter(Boolean),
  }
}

export async function getFollowUps({
  page = 1,
  limit = 8,
  search = '',
  status = 'ALL',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: String(search || ''),
    status: !status || status === 'all' ? 'ALL' : status,
  })
  const payload = await apiRequest(`/api/marketing/follow-ups?${params.toString()}`)
  const items = extractList(payload, ['items', 'followUps', 'sequences'])
    .map(mapFollowUp)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getFollowUp(id) {
  const payload = await apiRequest(`/api/marketing/follow-ups/${id}`)
  return mapFollowUp(extractItem(payload, ['sequence', 'followUp', 'item']))
}

export async function createFollowUp(form) {
  const payload = await apiRequest('/api/marketing/follow-ups', {
    method: 'POST',
    body: {
      name: String(form.name || '').trim(),
      description: String(form.description || '').trim(),
      targetAudience: String(form.targetAudience || '').trim(),
      trigger: form.trigger,
      status: form.status,
    },
  })
  return mapFollowUp(extractItem(payload, ['sequence', 'followUp', 'item']))
}

export async function pauseFollowUp(id) {
  const payload = await apiRequest(`/api/marketing/follow-ups/${id}/pause`, {
    method: 'PATCH',
  })
  return mapFollowUp(extractItem(payload, ['sequence', 'followUp', 'item']))
}

export async function resumeFollowUp(id) {
  const payload = await apiRequest(`/api/marketing/follow-ups/${id}/resume`, {
    method: 'PATCH',
  })
  return mapFollowUp(extractItem(payload, ['sequence', 'followUp', 'item']))
}

const marketingFollowUpService = {
  getFollowUps,
  getFollowUp,
  createFollowUp,
  pauseFollowUp,
  resumeFollowUp,
}

export default marketingFollowUpService
