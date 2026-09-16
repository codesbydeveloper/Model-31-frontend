import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'

export function mapScript(raw) {
  if (!raw || typeof raw !== 'object') return null
  const status = String(raw.status || 'PENDING').toUpperCase()
  const copyEnabled =
    raw.copyEnabled === true || status === 'APPROVED' || status === 'EDITED'
  return {
    id: raw.id || raw._id,
    token: textValue(raw.token || raw.approveToken),
    leadId: textValue(raw.leadId || raw.lead?.id),
    customerName: textValue(raw.customerName || raw.lead?.customerName),
    vehicle: textValue(raw.vehicle || raw.lead?.vehicle),
    dealership: textValue(raw.dealership || raw.lead?.dealership),
    platform: textValue(raw.platform) || 'Instagram',
    script: textValue(raw.script || raw.body || raw.text),
    caption: textValue(raw.caption),
    cta: textValue(raw.cta || raw.callToAction),
    status,
    copyEnabled,
    createdAt: raw.createdAt || '',
    createdLabel: formatStamp(raw.createdAt) || textValue(raw.createdLabel),
    approvedAt: raw.approvedAt || null,
  }
}

export async function getSalespersonScripts({
  page = 1,
  limit = 10,
  status = 'ALL',
  leadId = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: !status || status === 'all' ? 'ALL' : String(status).toUpperCase(),
  })
  if (leadId) params.set('leadId', leadId)
  const payload = await apiRequest(`/api/salesperson/scripts?${params.toString()}`)
  const items = extractList(payload, ['scripts', 'items']).map(mapScript).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getSalespersonScript(id) {
  const payload = await apiRequest(`/api/salesperson/scripts/${encodeURIComponent(id)}`)
  return mapScript(extractItem(payload, ['script', 'item']))
}

export async function approveSalespersonScript(id) {
  const payload = await apiRequest(
    `/api/salesperson/scripts/${encodeURIComponent(id)}/approve`,
    { method: 'PATCH' },
  )
  return mapScript(extractItem(payload, ['script', 'item'])) || true
}

export async function editSalespersonScript(id, { script, caption, cta } = {}) {
  const payload = await apiRequest(`/api/salesperson/scripts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      script: String(script || '').trim(),
      caption: String(caption || '').trim(),
      cta: String(cta || '').trim(),
    },
  })
  return mapScript(extractItem(payload, ['script', 'item'])) || true
}

export async function getPublicScript(token) {
  const payload = await apiRequest(`/api/scripts/public/${encodeURIComponent(token)}`)
  return mapScript(extractItem(payload, ['script', 'item']))
}

export async function approvePublicScript(token) {
  const payload = await apiRequest(
    `/api/scripts/public/${encodeURIComponent(token)}/approve`,
    { method: 'POST' },
  )
  return mapScript(extractItem(payload, ['script', 'item'])) || true
}

const salespersonScriptService = {
  getSalespersonScripts,
  getSalespersonScript,
  approveSalespersonScript,
  editSalespersonScript,
  getPublicScript,
  approvePublicScript,
}

export default salespersonScriptService
