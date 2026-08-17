import { delay } from '../../utils/delay'
import {
  initialLeads,
  leadStatsOverview,
  scoreToTier,
} from '../../data/leads'
import { registerLeadArrays, syncSaAssign } from './leadStore'
import {
  classifyLead,
  isDealershipLead,
  isModel31Lead,
  isModel31Source,
  PIPELINE_TYPES,
} from '../../utils/pipeline'

let leads = structuredClone(initialLeads)
registerLeadArrays({ saLeads: leads })

function rebindSa() {
  registerLeadArrays({ saLeads: leads })
}

function nowStamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pushActivity(lead, description, actor = 'System') {
  lead.activity = [
    {
      id: `${lead.id}-act-${Date.now()}`,
      description,
      actor,
      time: nowStamp(),
      at: new Date().toISOString(),
    },
    ...(lead.activity || []),
  ]
}

function pushTimeline(lead, label, description) {
  lead.timelineEvents = [
    ...(lead.timelineEvents || []),
    {
      id: `${lead.id}-tl-${Date.now()}`,
      label,
      description,
      time: nowStamp(),
      at: new Date().toISOString(),
    },
  ]
}

export async function getLeadStats() {
  await delay(250)
  return { ...leadStatsOverview }
}

export async function getLeads() {
  await delay(350)
  return structuredClone(leads.map((lead) => classifyLead(lead)))
}

export async function getLeadById(id) {
  await delay(300)
  const lead = leads.find((item) => item.id === id)
  return lead ? structuredClone(classifyLead(lead)) : null
}

export async function updateLead(id, payload) {
  await delay(650)
  const index = leads.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Lead not found')

  const next = {
    ...leads[index],
    ...payload,
    id,
  }

  if (isDealershipLead(leads[index])) {
    next.pipelineType = PIPELINE_TYPES.DEALERSHIP
    next.classificationStatus = 'DEALERSHIP_LEAD'
    if (payload.source && isModel31Source(payload.source)) {
      next.source = leads[index].source
    }
    next.model31_signature = 'NOT APPLICABLE'
    delete next.model31_tracking_id
    delete next.content_id
    delete next.social_origin
    delete next.engagement_type
    delete next.salesperson_profile_id
  } else {
    Object.assign(next, classifyLead(next))
  }

  if (typeof next.score === 'number') {
    next.tier = scoreToTier(next.score)
  }

  pushActivity(next, 'Lead details updated', 'Alex Rivera')
  leads[index] = next
  rebindSa()
  return structuredClone(next)
}

export async function updateLeadStatus(id, status) {
  await delay(600)
  const index = leads.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Lead not found')

  leads[index] = {
    ...leads[index],
    status,
  }
  pushActivity(leads[index], `Lead status changed to ${status}`, 'Alex Rivera')
  pushTimeline(leads[index], 'Status Updated', `Status set to ${status}`)
  rebindSa()
  return structuredClone(leads[index])
}

export async function assignLead(id, salesperson) {
  await delay(700)
  const index = leads.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Lead not found')

  leads[index] = {
    ...leads[index],
    salesperson: salesperson.name,
    salespersonId: salesperson.id,
    status:
      leads[index].status === 'NEW' || leads[index].status === 'QUALIFYING'
        ? 'ROUTED'
        : leads[index].status === 'QUALIFIED'
          ? 'ROUTED'
          : leads[index].status,
  }

  pushActivity(
    leads[index],
    `Salesperson assigned: ${salesperson.name}`,
    'Alex Rivera',
  )
  pushTimeline(
    leads[index],
    'Lead Routed',
    `Assigned to ${salesperson.name}`,
  )

  rebindSa()
  syncSaAssign(id, salesperson)

  return structuredClone(leads[index])
}

export async function addLeadNote(id, note) {
  await delay(550)
  const index = leads.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Lead not found')

  const entry = {
    id: `note_${Date.now()}`,
    text: note,
    author: 'Alex Rivera',
    time: nowStamp(),
    at: new Date().toISOString(),
  }

  leads[index] = {
    ...leads[index],
    notes: [entry, ...(leads[index].notes || [])],
  }

  pushActivity(leads[index], `Note added: ${note}`, 'Alex Rivera')
  pushTimeline(leads[index], 'Note Added', note)

  return structuredClone(leads[index])
}

export async function setLeadAiPaused(id, paused) {
  await delay(450)
  const index = leads.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Lead not found')

  leads[index] = {
    ...leads[index],
    aiPaused: paused,
  }

  pushActivity(
    leads[index],
    paused ? 'AI paused' : 'AI resumed',
    'Alex Rivera',
  )
  pushTimeline(
    leads[index],
    paused ? 'AI Paused' : 'AI Resumed',
    paused ? 'Human agent active' : 'AI conversation active',
  )

  return structuredClone(leads[index])
}

export async function createLead(payload) {
  await delay(700)
  const id = `LEAD-${2073 + leads.length}`
  const score = Number(payload.score) || 50
  const created = {
    id,
    customerName: payload.customerName,
    phone: payload.phone || '',
    email: payload.email || '',
    city: payload.city || payload.location || '',
    state: payload.state || '',
    language: payload.language || 'English',
    source: payload.source || 'Website',
    vehicle: payload.vehicle || '',
    budget: payload.budget || '',
    budgetValue: Number(payload.budgetValue) || 0,
    timeline: payload.timeline || '',
    location: payload.location || '',
    financing: payload.financing || '',
    score,
    tier: scoreToTier(score),
    status: payload.status || 'NEW',
    dealership: payload.dealership || 'Unassigned',
    dealershipId: payload.dealershipId || null,
    salesperson: payload.salesperson || 'Unassigned',
    salespersonId: payload.salespersonId || null,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    aiPaused: false,
    scoreBreakdown: {
      budget: 10,
      vehicle: 10,
      timeline: 10,
      location: 10,
      financing: 10,
    },
    notes: [],
    timelineEvents: [],
    activity: [],
  }
  pushActivity(created, 'Lead created', 'Alex Rivera')
  const classified = classifyLead(created)
  leads = [classified, ...leads]
  rebindSa()
  return structuredClone(classified)
}

export { classifyLead, isModel31Lead, isDealershipLead }

export async function getModel31Leads() {
  await delay(250)
  return structuredClone(leads.filter((lead) => isModel31Lead(lead)))
}

export async function getDealershipLeads() {
  await delay(250)
  return structuredClone(leads.filter((lead) => isDealershipLead(lead)))
}

function pipelineStats(list) {
  const sold = list.filter((l) => l.status === 'CLOSED' || l.status === 'SOLD').length
  const qualified = list.filter((l) =>
    ['QUALIFIED', 'ROUTED', 'CLOSED', 'SOLD'].includes(l.status),
  ).length
  const appointments = list.filter((l) =>
    ['ROUTED', 'CLOSED', 'SOLD', 'APPOINTMENT'].includes(l.status),
  ).length
  const active = list.filter((l) => !['CLOSED', 'SOLD', 'NOT SOLD'].includes(l.status)).length
  return {
    total: list.length,
    active,
    qualified,
    appointments,
    sold,
  }
}

export async function getPipelineTransparency() {
  await delay(320)
  const model31 = leads.filter((lead) => isModel31Lead(lead))
  const dealership = leads.filter((lead) => isDealershipLead(lead))
  return {
    model31: pipelineStats(model31),
    dealership: pipelineStats(dealership),
    rows: structuredClone(leads.map((lead) => classifyLead(lead))),
  }
}

const leadService = {
  getLeadStats,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  addLeadNote,
  setLeadAiPaused,
  createLead,
  classifyLead,
  isModel31Lead,
  isDealershipLead,
  getModel31Leads,
  getDealershipLeads,
  getPipelineTransparency,
}

export default leadService
