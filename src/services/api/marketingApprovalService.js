import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
} from './payload'
import {
  mapMarketingContent,
  joinHashtags,
} from './marketingContentService'

export async function getApprovalQueue({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/marketing/approval?${params.toString()}`)
  const items = extractList(payload, ['items', 'approvals', 'content'])
    .map(mapMarketingContent)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getApprovalItem(id) {
  const payload = await apiRequest(`/api/marketing/approval/${id}`)
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'approval']))
}

export async function approveApprovalItem(id) {
  const payload = await apiRequest(`/api/marketing/approval/${id}/approve`, {
    method: 'POST',
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'approval']))
}

export async function rejectApprovalItem(id, reason) {
  const payload = await apiRequest(`/api/marketing/approval/${id}/reject`, {
    method: 'POST',
    body: { reason: String(reason || '').trim() },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'approval']))
}

export async function requestApprovalChanges(id, notes) {
  const payload = await apiRequest(`/api/marketing/approval/${id}/request-changes`, {
    method: 'POST',
    body: { notes: String(notes || '').trim() },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'approval']))
}

export async function updateApprovalItem(id, form) {
  const payload = await apiRequest(`/api/marketing/approval/${id}`, {
    method: 'PUT',
    body: {
      title: String(form.title || '').trim(),
      body: String(form.body || '').trim(),
      hashtags: joinHashtags(form.hashtags),
    },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'approval']))
}

const marketingApprovalService = {
  getApprovalQueue,
  getApprovalItem,
  approveApprovalItem,
  rejectApprovalItem,
  requestApprovalChanges,
  updateApprovalItem,
}

export default marketingApprovalService
