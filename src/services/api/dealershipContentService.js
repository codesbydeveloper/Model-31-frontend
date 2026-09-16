import { apiRequest } from './http'
import { extractList, extractItem, textValue } from './payload'

function mapContent(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.contentId,
    title: textValue(raw.title || raw.name) || 'Untitled',
    platform: textValue(raw.platform) || '—',
    status: textValue(raw.status) || 'DRAFT',
    type: textValue(raw.type || raw.contentType),
    body: textValue(raw.body || raw.caption || raw.copy || raw.description),
    dealership: textValue(raw.dealership),
  }
}

export async function getDealershipAiContent() {
  const payload = await apiRequest('/api/dealership/ai-content')
  return extractList(payload, ['content', 'items']).map(mapContent).filter(Boolean)
}

export async function getDealershipAiContentById(id) {
  const payload = await apiRequest(`/api/dealership/ai-content/${id}`)
  return mapContent(extractItem(payload, ['content']))
}

const dealershipContentService = {
  getDealershipAiContent,
  getDealershipAiContentById,
}

export default dealershipContentService
