import { apiRequest } from './http'
import {
  extractList,
  extractPagination,
  textValue,
} from './payload'
import { PIPELINE_TYPES } from '../../utils/pipeline'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function pipelineQuery(value) {
  const raw = String(value || '').trim()
  if (!raw || raw.toUpperCase() === 'ALL' || raw.toLowerCase() === 'all') return 'ALL'
  if (raw.replace(/\s+/g, '').toUpperCase() === 'MODEL31') return 'MODEL 31'
  return 'DEALERSHIP'
}

function normalizePipeline(value) {
  if (pipelineQuery(value) === 'MODEL 31') return PIPELINE_TYPES.MODEL31
  if (pipelineQuery(value) === 'DEALERSHIP') return PIPELINE_TYPES.DEALERSHIP
  return PIPELINE_TYPES.DEALERSHIP
}

function mapPipelineStats(raw = {}, fallbackLabel) {
  return {
    label: textValue(raw.label, fallbackLabel),
    leads: numberValue(raw.leads),
    qualified: numberValue(raw.qualified, raw.qualifiedLeads),
    appointments: numberValue(raw.appointments),
    sold: numberValue(raw.sold, raw.soldDeals),
  }
}

export async function getAttributionStats() {
  const payload = await apiRequest('/api/marketing/attribution/stats')
  return {
    model31: mapPipelineStats(payload.model31 || payload.data?.model31, 'MODEL 31'),
    dealership: mapPipelineStats(
      payload.dealership || payload.data?.dealership,
      'DEALERSHIP',
    ),
  }
}

export async function getAttributionFunnel() {
  const payload = await apiRequest('/api/marketing/attribution/funnel')
  return extractList(payload, ['funnel']).map((row, index) => ({
    key: textValue(row.stage || row.key, `step_${index}`),
    label: textValue(row.stage || row.label, `Step ${index + 1}`),
    value: numberValue(row.value, row.count),
    conversionRate:
      row.conversionRate == null || row.conversionRate === ''
        ? null
        : numberValue(row.conversionRate),
    from: textValue(row.from),
  }))
}

export async function getAttributionJourney() {
  const payload = await apiRequest('/api/marketing/attribution/journey')
  return extractList(payload, ['journey']).map((row, index) => ({
    stage: textValue(row.stage || row.label, `Step ${index + 1}`),
    count: numberValue(row.value, row.count),
    isCurrency:
      row.isCurrency === true ||
      String(row.type || '').toLowerCase() === 'currency',
  }))
}

export async function getAttributionBreakdown({
  page = 1,
  limit = 10,
  pipeline = 'ALL',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    pipeline: pipelineQuery(pipeline),
  })
  const payload = await apiRequest(
    `/api/marketing/attribution/breakdown?${params.toString()}`,
  )
  const items = extractList(payload, ['items']).map((row) => ({
    id: row.id || row._id,
    leadSource: textValue(row.source || row.leadSource),
    pipeline: normalizePipeline(row.pipeline),
    campaign: textValue(row.campaign),
    platform: textValue(row.platform),
    content: textValue(row.content),
    leads: numberValue(row.leads),
    qualifiedLeads: numberValue(row.qualified, row.qualifiedLeads),
    appointments: numberValue(row.appointments),
    soldDeals: numberValue(row.sold, row.soldDeals),
    revenue: numberValue(row.revenue),
  }))
  const pipelines = extractList(payload.options, ['pipelines'])
    .map((item) => textValue(item))
    .filter(Boolean)

  return {
    items,
    pipelines,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

const marketingAttributionService = {
  getAttributionStats,
  getAttributionFunnel,
  getAttributionJourney,
  getAttributionBreakdown,
}

export default marketingAttributionService
