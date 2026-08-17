export const PIPELINE_TYPES = {
  MODEL31: 'MODEL31',
  DEALERSHIP: 'DEALERSHIP',
}

export const CLASSIFICATION = {
  MODEL31_LEAD: 'MODEL31_LEAD',
  DEALERSHIP_LEAD: 'DEALERSHIP_LEAD',
}

export const MODEL31_SOURCES = [
  'Instagram',
  'TikTok',
  'Facebook',
  'YouTube',
  'Model 31 Content',
  'Authorized Staff Social Account',
  'Comment',
  'DM',
  'Proactive Engagement',
  'Acquisition Signal',
  'Intent Signal',
  'Life Event',
  'Engagement Signal',
]

export const DEALERSHIP_SOURCES = [
  'CRM',
  'Website',
  'Cars.com',
  'AutoTrader',
  'Phone',
  'Walk-in',
  'Service',
  'Showroom',
  'Third Party',
  'Referral',
  'Other',
  'WhatsApp',
]

function normalizeSource(source = '') {
  return String(source).trim()
}

export function isModel31Source(source) {
  const value = normalizeSource(source)
  return MODEL31_SOURCES.some((item) => item.toLowerCase() === value.toLowerCase())
}

export function isDealershipSource(source) {
  const value = normalizeSource(source)
  return DEALERSHIP_SOURCES.some((item) => item.toLowerCase() === value.toLowerCase())
}

export function isModel31Lead(lead) {
  if (!lead) return false
  if (lead.source) return isModel31Source(lead.source)
  if (lead.pipelineType === PIPELINE_TYPES.MODEL31) return true
  if (lead.classificationStatus === CLASSIFICATION.MODEL31_LEAD) return true
  return false
}

export function isDealershipLead(lead) {
  if (!lead) return false
  return !isModel31Lead(lead)
}

function numericFromId(id = '') {
  const digits = String(id).replace(/\D/g, '')
  return digits || '10000'
}

function engagementFromSource(source) {
  const value = normalizeSource(source)
  if (value === 'DM' || value === 'Authorized Staff Social Account') return 'DM'
  if (value === 'Comment') return 'Comment'
  if (value === 'Proactive Engagement') return 'Proactive Engagement'
  if (['Instagram', 'TikTok', 'Facebook', 'YouTube'].includes(value)) return 'DM'
  return 'Engagement'
}

function socialOriginFromSource(source) {
  const value = normalizeSource(source)
  if (['Instagram', 'TikTok', 'Facebook', 'YouTube'].includes(value)) return value
  if (value === 'Authorized Staff Social Account' || value === 'DM') return 'Instagram'
  if (value === 'Model 31 Content') return 'Instagram'
  return value || 'Instagram'
}

export function buildModel31Fingerprint(lead) {
  const n = numericFromId(lead.id)
  return {
    model31_tracking_id: lead.model31_tracking_id || `M31-TRK-${n}`,
    content_id: lead.content_id || `CONTENT-${n}`,
    social_origin: lead.social_origin || socialOriginFromSource(lead.source),
    engagement_type: lead.engagement_type || engagementFromSource(lead.source),
    salesperson_profile_id:
      lead.salesperson_profile_id ||
      (lead.salespersonId ? lead.salespersonId.replace('sp_', 'SP-') : 'SP-102'),
    timestamp: lead.timestamp || lead.createdAt || lead.createdLabel || '',
    model31_signature: 'VERIFIED',
  }
}

export function classifyLead(lead = {}) {
  const model31 = lead.source
    ? isModel31Source(lead.source)
    : lead.pipelineType === PIPELINE_TYPES.MODEL31
  if (model31) {
    const fingerprint = buildModel31Fingerprint(lead)
    return {
      ...lead,
      pipelineType: PIPELINE_TYPES.MODEL31,
      classificationStatus: CLASSIFICATION.MODEL31_LEAD,
      ...fingerprint,
    }
  }

  const next = {
    ...lead,
    pipelineType: PIPELINE_TYPES.DEALERSHIP,
    classificationStatus: CLASSIFICATION.DEALERSHIP_LEAD,
    model31_signature: 'NOT APPLICABLE',
  }
  delete next.model31_tracking_id
  delete next.content_id
  delete next.social_origin
  delete next.engagement_type
  delete next.salesperson_profile_id
  return next
}

export function pipelineLabel(type) {
  return type === PIPELINE_TYPES.MODEL31 ? 'MODEL 31' : 'DEALERSHIP'
}
