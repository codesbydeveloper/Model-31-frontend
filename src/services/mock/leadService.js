import { delay } from '../../utils/delay'
import {
  initialLeads,
  leadStatsOverview,
  scoreToTier,
} from '../../data/leads'
import { registerLeadArrays, syncSaAssign } from './leadStore'

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
  return structuredClone(leads)
}

export async function getLeadById(id) {
  await delay(300)
  const lead = leads.find((item) => item.id === id)
  return lead ? structuredClone(lead) : null
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
  leads = [created, ...leads]
  return structuredClone(created)
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
}

export default leadService
