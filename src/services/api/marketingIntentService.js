import { apiRequest } from './http'
import {
  extractList,
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

function moneyLabel(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && value.trim()) return value
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value)
  return `$${num.toLocaleString()}`
}

function mapKeyword(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `kw_${index}`,
    keyword: textValue(raw.keyword || raw.phrase || raw.term),
    category: textValue(raw.category),
    occurrences: numberValue(raw.occurrences, raw.count),
    customers: numberValue(raw.customers, raw.customerCount),
    intentLevel: textValue(raw.intentLevel || raw.intent || raw.level),
    lastDetected: formatDate(raw.lastDetected || raw.detectedAt || raw.updatedAt) || textValue(raw.lastDetected),
  }
}

function mapSignal(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `intent_${index}`,
    customerName: textValue(raw.customerName),
    detectedPhrase: textValue(raw.detectedPhrase || raw.phrase || raw.signal),
    category: textValue(raw.category),
    vehicle: textValue(raw.vehicle),
    budget: textValue(raw.budget) || moneyLabel(raw.paymentAmount),
    timeline: textValue(raw.timeline),
    intentLevel: textValue(raw.intentLevel || raw.intent || raw.level),
    detectedDate: formatDate(raw.detectedDate || raw.detectedAt || raw.createdAt) || textValue(raw.detectedDate),
    leadId: textValue(raw.leadLabel || raw.leadId) || null,
  }
}

function mapBudget(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `bud_${index}`,
    customerName: textValue(raw.customerName),
    budgetSignal: textValue(raw.budgetSignal || raw.signal || raw.budget),
    paymentAmount: moneyLabel(raw.paymentAmount || raw.payment),
    financing: textValue(raw.financing),
    vehicle: textValue(raw.vehicle),
    intent: textValue(raw.intent || raw.intentLevel || raw.level),
    date: formatDate(raw.date || raw.createdAt || raw.detectedAt) || textValue(raw.date),
    leadId: textValue(raw.leadLabel || raw.leadId) || null,
  }
}

export async function getIntentKeywords({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(
    `/api/marketing/intent-signals/keywords?${params.toString()}`,
  )
  const items = extractList(payload, ['items', 'keywords'])
    .map((row, index) => mapKeyword(row, index))
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getIntentSignals({ page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/marketing/intent-signals?${params.toString()}`)
  const stats = payload.stats || payload.data?.stats || {}
  const items = extractList(payload, ['items', 'signals'])
    .map((row, index) => mapSignal(row, index))
    .filter(Boolean)
  return {
    stats: {
      highIntent: numberValue(stats.highIntent),
      mediumIntent: numberValue(stats.mediumIntent),
      lowIntent: numberValue(stats.lowIntent),
      newSignals: numberValue(stats.newSignals),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getBudgetSignals({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(
    `/api/marketing/intent-signals/budget?${params.toString()}`,
  )
  const items = extractList(payload, ['items', 'budgetSignals', 'budgets'])
    .map((row, index) => mapBudget(row, index))
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function linkIntentLead(id, leadLabel) {
  await apiRequest(`/api/marketing/intent-signals/${id}/link-lead`, {
    method: 'PATCH',
    body: { leadLabel: String(leadLabel || '').trim() },
  })
  return true
}

export async function linkBudgetLead(id, leadLabel) {
  await apiRequest(`/api/marketing/intent-signals/budget/${id}/link-lead`, {
    method: 'PATCH',
    body: { leadLabel: String(leadLabel || '').trim() },
  })
  return true
}

const marketingIntentService = {
  getIntentKeywords,
  getIntentSignals,
  getBudgetSignals,
  linkIntentLead,
  linkBudgetLead,
}

export default marketingIntentService
