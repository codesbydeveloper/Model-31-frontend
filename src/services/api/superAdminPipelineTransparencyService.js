import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'
import { PIPELINE_TYPES } from '../../utils/pipeline'
import { LEAD_SOURCES, LEAD_STATUSES } from '../../data/leads'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
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

export function mapPipelineType(value) {
  const text = String(value || '')
    .toUpperCase()
    .replace(/\s+/g, '')
  if (text.includes('MODEL31')) return PIPELINE_TYPES.MODEL31
  return PIPELINE_TYPES.DEALERSHIP
}

function formatCreated(value) {
  if (value == null || value === '') return ''
  const text = String(value)
  if (/^[A-Za-z]{3} \d{1,2}, \d{4}/.test(text)) return text
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return text
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapStats(raw = {}) {
  return {
    total: numberValue(raw.totalLeads, raw.total),
    active: numberValue(raw.active),
    qualified: numberValue(raw.qualified),
    appointments: numberValue(raw.appointments),
    sold: numberValue(raw.sold),
  }
}

function mapFlowSteps(raw) {
  const list = Array.isArray(raw) ? raw : extractList(raw || {}, ['steps'])
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

function signatureLabel(raw, pipelineType) {
  const value = textValue(
    raw.model31Signature || raw.model31_signature || raw.signature,
  )
  if (value) return value
  return pipelineType === PIPELINE_TYPES.MODEL31 ? '✓ VERIFIED' : 'NOT APPLICABLE'
}

export function mapPipelineLead(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const pipelineType = mapPipelineType(
    raw.pipelineType || raw.pipeline || raw.pipelineName,
  )
  return {
    id: raw.id || raw.leadId || raw._id || `LEAD-${index + 1}`,
    customerName: textValue(raw.customerName || raw.customer || raw.name, 'Unknown'),
    email: textValue(raw.email),
    pipelineType,
    source: textValue(raw.source, '—'),
    classificationStatus: textValue(
      raw.classificationStatus || raw.classification,
      pipelineType === PIPELINE_TYPES.MODEL31 ? 'MODEL31_LEAD' : 'DEALERSHIP_LEAD',
    ),
    status: textValue(raw.status, 'NEW').toUpperCase(),
    salesperson: textValue(raw.salesperson || raw.salespersonName, 'Unassigned'),
    createdLabel:
      textValue(raw.createdLabel) ||
      formatCreated(raw.created || raw.createdAt) ||
      '—',
    model31_signature: signatureLabel(raw, pipelineType),
    dealership: textValue(raw.dealership || raw.dealershipName),
    fingerprint: raw.fingerprint && typeof raw.fingerprint === 'object' ? raw.fingerprint : null,
    model31Access: textValue(raw.model31Access || raw.access),
  }
}

export const EMPTY_PIPELINE_PAGE = {
  pageTitle: 'Pipeline Transparency',
  description: 'Monitor the separation between Model 31 leads and dealership leads.',
  enforcementNote: '',
  model31: mapStats(),
  dealership: mapStats(),
  staffFlow: { title: 'Staff Social Lead Flow (Model 31)', steps: [] },
  dealershipFlow: { title: 'Dealership CRM Lead Flow', steps: [] },
  options: {
    pipelines: asOptions(['MODEL 31', 'DEALERSHIP'], ['MODEL 31', 'DEALERSHIP'], 'All pipelines'),
    sources: asOptions(LEAD_SOURCES, LEAD_SOURCES, 'All sources'),
    statuses: asOptions(LEAD_STATUSES, LEAD_STATUSES, 'All statuses'),
  },
  items: [],
  total: 0,
}

export async function getPipelineTransparency({
  search = '',
  pipeline = '',
  source = '',
  status = '',
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)
  if (pipeline && !String(pipeline).toLowerCase().startsWith('all ')) {
    params.set('pipeline', pipeline)
  }
  if (source && !String(source).toLowerCase().startsWith('all ')) {
    params.set('source', source)
  }
  if (status && !String(status).toLowerCase().startsWith('all ')) {
    params.set('status', status)
  }

  const payload = await apiRequest(
    `/api/super-admin/pipeline-transparency?${params.toString()}`,
  )
  const summary = payload.summary || {}
  const flows = payload.mockFlows || payload.flows || {}
  const options = payload.options || {}
  const items = extractList(payload, ['rows', 'leads', 'items']).map(mapPipelineLead).filter(Boolean)

  return {
    pageTitle: textValue(payload.pageTitle, EMPTY_PIPELINE_PAGE.pageTitle),
    description: textValue(payload.description, EMPTY_PIPELINE_PAGE.description),
    enforcementNote: textValue(payload.enforcementNote),
    model31: mapStats(summary.model31Pipeline || summary.model31 || payload.model31),
    dealership: mapStats(
      summary.dealershipPipeline || summary.dealership || payload.dealership,
    ),
    staffFlow: {
      title: textValue(
        flows.staffSocialLead?.title || flows.staffSocial?.title,
        'Staff Social Lead Flow (Model 31)',
      ),
      steps: mapFlowSteps(flows.staffSocialLead || flows.staffSocial),
    },
    dealershipFlow: {
      title: textValue(
        flows.dealershipCrmLead?.title || flows.dealership?.title,
        'Dealership CRM Lead Flow',
      ),
      steps: mapFlowSteps(flows.dealershipCrmLead || flows.dealershipCrm || flows.dealership),
    },
    options: {
      pipelines: asOptions(options.pipelines, ['MODEL 31', 'DEALERSHIP'], 'All pipelines'),
      sources: asOptions(options.sources, LEAD_SOURCES, 'All sources'),
      statuses: asOptions(options.statuses, LEAD_STATUSES, 'All statuses'),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getPipelineLead(id) {
  const payload = await apiRequest(
    `/api/super-admin/pipeline-transparency/${encodeURIComponent(id)}`,
  )
  const raw = extractItem(payload, ['lead', 'item', 'row']) || payload
  const lead = mapPipelineLead(raw)
  if (!lead) return null
  const fingerprint = raw.fingerprint && typeof raw.fingerprint === 'object' ? raw.fingerprint : {}
  const flow = mapFlowSteps(raw.flow || raw.steps || payload.flow)
  return {
    ...lead,
    email: lead.email || textValue(raw.email),
    phone: textValue(raw.phone),
    dealership: lead.dealership || textValue(raw.dealership),
    model31Access: textValue(raw.model31Access, lead.pipelineType === PIPELINE_TYPES.DEALERSHIP ? 'READ ONLY' : ''),
    trackingId: textValue(
      fingerprint.model31_tracking_id || fingerprint.trackingId || raw.model31_tracking_id,
    ),
    contentId: textValue(fingerprint.content_id || fingerprint.contentId || raw.content_id),
    socialOrigin: textValue(
      fingerprint.social_origin || fingerprint.socialOrigin || raw.social_origin,
    ),
    engagementType: textValue(
      fingerprint.engagement_type || fingerprint.engagementType || raw.engagement_type,
    ),
    salespersonProfileId: textValue(
      fingerprint.salesperson_profile_id || raw.salesperson_profile_id,
    ),
    flow,
    note: textValue(raw.note || raw.enforcementNote || payload.enforcementNote),
  }
}
