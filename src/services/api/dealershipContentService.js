import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function pickRecord(payload) {
  if (!payload || typeof payload !== 'object') return null
  const nestedKeys = ['content', 'item', 'record']
  for (const key of nestedKeys) {
    const value = payload[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) return value
  }
  const data = payload.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of nestedKeys) {
      const value = data[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) return value
    }
    if (data.script || data.caption || data.body || data.title || data.id) return data
  }
  return extractItem(payload, nestedKeys)
}

function parseHashtags(value) {
  if (Array.isArray(value)) return value.map((tag) => textValue(tag)).filter(Boolean)
  return String(value || '')
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function mapScenes(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, index) => {
      if (typeof item === 'string') return { scene: index + 1, text: item }
      if (!item || typeof item !== 'object') return null
      return {
        scene: item.scene || index + 1,
        text: textValue(item.text || item.detail || item.message),
      }
    })
    .filter((item) => item?.text)
}

function mapContent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const preview = raw.preview && typeof raw.preview === 'object' ? raw.preview : {}
  const title = textValue(
    raw.caption || raw.title || raw.name || preview.caption || preview.title,
  )
  const body = textValue(
    raw.script ||
      raw.body ||
      raw.copy ||
      preview.script ||
      preview.body ||
      raw.description,
  )
  return {
    id: raw.id || raw._id || raw.contentId,
    title: title || 'Untitled',
    platform: textValue(raw.platform || preview.platform) || '—',
    status: textValue(raw.status) || 'DRAFT',
    type: textValue(raw.type || raw.contentType),
    body,
    cta: textValue(raw.cta || raw.callToAction || preview.cta),
    hashtags: parseHashtags(raw.hashtags || preview.hashtags),
    vehicle: textValue(raw.vehicle),
    offer: textValue(raw.offer),
    tone: textValue(raw.tone),
    language: textValue(raw.language),
    audience: textValue(raw.targetAudience || raw.audience),
    brief: textValue(raw.brief),
    campaign: textValue(raw.campaignName || raw.campaign),
    dealership: textValue(raw.dealershipName || raw.dealership),
    createdBy: textValue(raw.createdBy),
    createdAt: formatStamp(raw.createdAt || raw.createdDate) || textValue(raw.createdAt),
    scheduledAt:
      formatStamp(raw.scheduledAt || raw.scheduledDate) || textValue(raw.scheduledAt),
    imageUrl: textValue(raw.imageUrl || preview.imageUrl),
    imagePrompt: textValue(raw.imagePrompt),
    videoDuration: textValue(raw.videoDuration),
    scenes: mapScenes(raw.scenes),
  }
}

export async function getDealershipAiContent() {
  const payload = await apiRequest('/api/dealership/ai-content')
  return extractList(payload, ['content', 'items', 'rows']).map(mapContent).filter(Boolean)
}

export async function getDealershipAiContentById(id) {
  const payload = await apiRequest(`/api/dealership/ai-content/${id}`)
  return mapContent(pickRecord(payload))
}

const dealershipContentService = {
  getDealershipAiContent,
  getDealershipAiContentById,
}

export default dealershipContentService
