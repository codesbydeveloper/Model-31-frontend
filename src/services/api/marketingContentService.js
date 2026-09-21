import { apiRequest, ApiError } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'
import {
  CONTENT_TYPES,
  CONTENT_STATUSES,
  SOCIAL_PLATFORMS,
  TONES,
  LANGUAGES,
  AUDIENCES,
} from '../../data/marketingContent'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${formatDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function parseHashtags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => textValue(tag)).filter(Boolean)
  }
  return String(value || '')
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function joinHashtags(value) {
  return parseHashtags(value).join(' ')
}

function mapScenes(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    if (typeof item === 'string') {
      const match = item.match(/^Scene\s+(\d+):\s*(.*)$/i)
      return {
        scene: match ? Number(match[1]) : index + 1,
        text: match ? match[2] : item,
      }
    }
    if (!item || typeof item !== 'object') return null
    return {
      scene: numberValue(item.scene, index + 1),
      text: textValue(item.text || item.detail || item.message),
    }
  }).filter(Boolean)
}

function mapActivity(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || `aca_${index}`,
    description: textValue(raw.activityType || raw.description || raw.detail),
    actor: textValue(raw.actor),
    time: formatDateTime(raw.createdAt || raw.time) || textValue(raw.time),
  }
}

export function mapMarketingContent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const preview = raw.preview && typeof raw.preview === 'object' ? raw.preview : {}
  const performance = raw.performance && typeof raw.performance === 'object' ? raw.performance : {}
  const hashtags = parseHashtags(raw.hashtags || preview.hashtags)

  return {
    id: raw.id || raw._id,
    leadId: textValue(raw.leadId || raw.lead?.id),
    contentType: textValue(raw.contentType),
    dealershipId: textValue(raw.dealershipId),
    dealership: textValue(raw.dealershipName || raw.dealership),
    campaignId: textValue(raw.campaignId),
    campaign: textValue(raw.campaignName || raw.campaign),
    platform: textValue(raw.platform || preview.platform) || 'Instagram',
    status: textValue(raw.status) || 'DRAFT',
    createdBy: textValue(raw.createdBy),
    createdDate: formatDate(raw.createdAt || raw.createdDate) || textValue(raw.createdDate),
    scheduledDate: formatDate(raw.scheduledAt || raw.scheduledDate) || textValue(raw.scheduledDate),
    vehicle: textValue(raw.vehicle),
    offer: textValue(raw.offer),
    tone: textValue(raw.tone),
    language: textValue(raw.language),
    audience: textValue(raw.targetAudience || raw.audience),
    brief: textValue(raw.brief),
    script: textValue(raw.script || raw.body || preview.body),
    caption: textValue(raw.caption || raw.title || preview.title),
    cta: textValue(raw.cta || raw.callToAction || preview.cta),
    body: textValue(raw.script || raw.body || preview.body),
    title: textValue(raw.caption || raw.title || preview.title),
    hashtags,
    imagePrompt: textValue(raw.imagePrompt),
    imageUrl: textValue(raw.imageUrl || preview.imageUrl),
    videoDuration: textValue(raw.videoDuration),
    scenes: mapScenes(raw.scenes),
    rejectionReason: textValue(raw.rejectionReason),
    performance: {
      reach: numberValue(raw.reach, performance.reach),
      engagement: numberValue(raw.engagement, performance.engagement),
      clicks: numberValue(raw.clicks, performance.clicks),
      leads: numberValue(raw.leads, raw.leadsCount, performance.leads),
      appointments: numberValue(
        raw.appointments,
        raw.appointmentsCount,
        performance.appointments,
      ),
    },
    activity: extractList(raw.activityHistory || raw.activity).map(mapActivity).filter(Boolean),
  }
}

function hasFilterValue(value) {
  if (value == null || value === '') return false
  const text = String(value)
  return text !== 'all' && text !== 'ALL'
}

function asList(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    if (Array.isArray(value.items)) return value.items
    if (Array.isArray(value.rows)) return value.rows
  }
  return []
}

function mapNamedOptions(raw) {
  return asList(raw)
    .map((row) => {
      if (row == null) return null
      if (typeof row === 'string') {
        return { id: row, name: row, dealershipId: '', dealershipName: '' }
      }
      const id = row.id || row._id || row.value
      if (!id) return null
      return {
        id: String(id),
        name: textValue(row.name || row.label, String(id)),
        dealershipId: textValue(row.dealershipId),
        dealershipName: textValue(row.dealershipName || row.dealership),
      }
    })
    .filter(Boolean)
}

function mapStringOptions(raw, fallback = []) {
  const values = asList(raw)
    .map((row) =>
      typeof row === 'string' ? row : textValue(row.name || row.label || row.value || row),
    )
    .filter(Boolean)
  return values.length ? values : fallback
}

export async function getMarketingContent({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  platform = '',
  contentType = '',
  dealershipId = '',
  campaignId = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const trimmedSearch = String(search || '').trim()
  if (trimmedSearch) params.set('search', trimmedSearch)
  if (hasFilterValue(status)) params.set('status', status)
  if (hasFilterValue(platform)) params.set('platform', platform)
  if (hasFilterValue(contentType)) params.set('contentType', contentType)
  if (hasFilterValue(dealershipId)) params.set('dealershipId', dealershipId)
  if (hasFilterValue(campaignId)) params.set('campaignId', campaignId)

  const payload = await apiRequest(`/api/marketing/content?${params.toString()}`)
  const items = extractList(payload, ['items', 'content', 'records'])
    .map(mapMarketingContent)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getMarketingContentById(id) {
  const payload = await apiRequest(`/api/marketing/content/${id}`)
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function getContentCreateOptions() {
  const payload = await apiRequest('/api/marketing/content/options')
  const root =
    payload?.options ||
    payload?.data?.options ||
    extractItem(payload, ['options', 'item']) ||
    payload?.data ||
    payload ||
    {}

  const campaigns = mapNamedOptions(root.campaigns)
  const dealerships = mapNamedOptions(root.dealerships)
  const uniqueDealerships = dealerships.length
    ? dealerships
    : Array.from(
        new Map(
          campaigns.map((row) => [
            row.dealershipId,
            { id: row.dealershipId, name: row.dealershipName || row.name },
          ]),
        ).values(),
      ).filter((row) => row.id)

  return {
    dealerships: uniqueDealerships,
    campaigns,
    platforms: mapStringOptions(
      root.platforms,
      SOCIAL_PLATFORMS.filter((item) => item !== 'WhatsApp'),
    ),
    tones: mapStringOptions(root.tones, TONES),
    languages: mapStringOptions(root.languages, LANGUAGES),
    audiences: mapStringOptions(root.targetAudiences || root.audiences, AUDIENCES),
    contentTypes: mapStringOptions(root.contentTypes, CONTENT_TYPES),
    statuses: mapStringOptions(root.statuses, CONTENT_STATUSES),
  }
}

export async function generateMarketingContent(form) {
  const payload = await apiRequest('/api/marketing/content/generate', {
    method: 'POST',
    body: {
      dealershipId: form.dealershipId,
      campaignId: form.campaignId,
      contentType: 'Sales Script',
      platform: form.platform,
      vehicle: String(form.vehicle || '').trim(),
      offer: String(form.offer || '').trim(),
      tone: form.tone,
      language: form.language,
      targetAudience: form.audience || form.targetAudience,
      brief: String(form.brief || '').trim(),
      cta: String(form.cta || '').trim(),
    },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function regenerateMarketingContent(id) {
  const payload = await apiRequest(`/api/marketing/content/${id}/regenerate`, {
    method: 'POST',
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function saveMarketingContentDraft(id, form) {
  const payload = await apiRequest(`/api/marketing/content/${id}/save-draft`, {
    method: 'POST',
    body: {
      script: String(form.script || form.body || '').trim(),
      caption: String(form.caption || form.title || '').trim(),
      cta: String(form.cta || '').trim(),
    },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function submitMarketingContent(id, { leadId } = {}) {
  const payload = await apiRequest(`/api/marketing/content/${id}/submit`, {
    method: 'POST',
    body: leadId ? { leadId } : {},
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export function mapMarketingSalesperson(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw._id || raw.salespersonId
  if (!id) return null
  const name = textValue(raw.name || raw.fullName, 'Salesperson')
  const dealership = textValue(raw.dealership || raw.dealershipName)
  return {
    id: String(id),
    name,
    email: textValue(raw.email),
    dealership,
    presence: textValue(raw.presence),
    label: dealership ? `${name} · ${dealership}` : name,
  }
}

export async function getMarketingSalespeople(dealershipId = '') {
  const params = new URLSearchParams()
  const id = String(dealershipId || '').trim()
  if (id) params.set('dealershipId', id)
  const query = params.toString()
  const payload = await apiRequest(
    `/api/marketing/salespeople${query ? `?${query}` : ''}`,
  )
  return extractList(payload, ['salespeople', 'items', 'users'])
    .map(mapMarketingSalesperson)
    .filter(Boolean)
}

export async function sendScriptToSalesperson(id, { salespersonId } = {}) {
  const trimmedId = String(salespersonId || '').trim()
  if (!trimmedId) {
    throw new ApiError('Select a salesperson to send this script.')
  }
  const payload = await apiRequest(
    `/api/marketing/content/${id}/send-to-salesperson`,
    {
      method: 'POST',
      body: { salespersonId: trimmedId },
    },
  )
  return mapMarketingContent(extractItem(payload, ['content', 'item', 'script'])) || true
}

export async function approveMarketingContent(id) {
  const payload = await apiRequest(`/api/marketing/content/${id}/approve`, {
    method: 'POST',
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function updateMarketingContent(id, form) {
  const payload = await apiRequest(`/api/marketing/content/${id}`, {
    method: 'PUT',
    body: {
      title: String(form.title || form.caption || '').trim(),
      body: String(form.body || form.script || '').trim(),
      platform: form.platform || 'Instagram',
    },
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function duplicateMarketingContent(id) {
  const payload = await apiRequest(`/api/marketing/content/${id}/duplicate`, {
    method: 'POST',
  })
  return mapMarketingContent(extractItem(payload, ['content', 'item']))
}

export async function deleteMarketingContent(id) {
  await apiRequest(`/api/marketing/content/${id}`, { method: 'DELETE' })
  return true
}

const marketingContentApi = {
  getMarketingContent,
  getMarketingContentById,
  getContentCreateOptions,
  getMarketingSalespeople,
  generateMarketingContent,
  regenerateMarketingContent,
  saveMarketingContentDraft,
  submitMarketingContent,
  sendScriptToSalesperson,
  approveMarketingContent,
  updateMarketingContent,
  duplicateMarketingContent,
  deleteMarketingContent,
}

export default marketingContentApi
