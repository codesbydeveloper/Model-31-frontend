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

function saleLabel(value) {
  if (value == null || value === '' || value === false) return '—'
  if (value === true) return 'Yes'
  const text = String(value).trim()
  if (!text || text === 'null' || text === '-') return '—'
  if (/^(yes|true|sold)$/i.test(text)) return 'Yes'
  return text
}

export async function getEligibleReferrals() {
  const payload = await apiRequest('/api/marketing/referrals/eligible')
  const items = extractList(payload, ['items', 'eligible']).map((row, index) => ({
    id: row.id || row._id || row.eligibleId || `rel_${index}`,
    customerName: textValue(row.customerName),
    status: textValue(row.status) || 'Eligible',
  }))
  return items
}

export async function getReferrals({ page = 1, limit = 8 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/marketing/referrals?${params.toString()}`)
  const stats = payload.stats || payload.data?.stats || {}
  const items = extractList(payload, ['items', 'referrals', 'rows']).map((row, index) => ({
    id: row.id || row._id || `ref_${index}`,
    referrer: textValue(row.referrerName || row.referrer),
    referredPerson: textValue(row.referredPerson) || 'Pending',
    source: textValue(row.source),
    date: formatDate(row.date || row.createdAt) || textValue(row.date),
    status: textValue(row.status) || 'REQUESTED',
    lead: textValue(row.leadLabel || row.lead) || '—',
    appointment: textValue(row.appointmentId || row.appointment) || '—',
    sale: saleLabel(row.sale),
  }))

  return {
    stats: {
      referralRequests: numberValue(stats.requests, stats.referralRequests),
      referralLeads: numberValue(stats.referralLeads),
      qualifiedReferrals: numberValue(stats.qualified, stats.qualifiedReferrals),
      appointments: numberValue(stats.appointments),
      soldReferrals: numberValue(stats.sold, stats.soldReferrals),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function askForReferral({ eligibleId, message }) {
  await apiRequest('/api/marketing/referrals/ask', {
    method: 'POST',
    body: {
      eligibleId,
      message: String(message || '').trim(),
    },
  })
  return true
}

const marketingReferralService = {
  getEligibleReferrals,
  getReferrals,
  askForReferral,
}

export default marketingReferralService
