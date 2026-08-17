import { delay } from '../../utils/delay'
import {
  initialSalespeople,
  salespersonPortalStats,
  SP_STATUS_KEY,
} from '../../data/salespeople'
import { initialSalespersonLeads } from '../../data/salespersonLeads'
import {
  registerLeadArrays,
  syncAfterAccept,
  syncAfterDecline,
  syncSpStatusToPlatform,
  getStoredLead,
} from './leadStore'
import { classifyLead } from '../../utils/pipeline'

let salespeople = structuredClone(initialSalespeople)
let myLeads = structuredClone(initialSalespersonLeads)

registerLeadArrays({ spLeads: myLeads })

function rebindSp() {
  registerLeadArrays({ spLeads: myLeads })
}

function readStoredStatus(defaultStatus = 'OFFLINE') {
  try {
    return localStorage.getItem(SP_STATUS_KEY) || defaultStatus
  } catch {
    return defaultStatus
  }
}

function writeStoredStatus(status) {
  try {
    localStorage.setItem(SP_STATUS_KEY, status)
  } catch {
    // ignore
  }
}

export async function getSalespeople() {
  await delay(250)
  return structuredClone(salespeople)
}

export async function getSalespersonById(id) {
  await delay(200)
  const person = salespeople.find((item) => item.id === id)
  return person ? structuredClone(person) : null
}

export async function getCurrentSalesperson() {
  await delay(200)
  const person = salespeople.find((item) => item.id === 'sp_001')
  const status = readStoredStatus(person?.status || 'OFFLINE')
  return structuredClone({ ...person, status })
}

export async function updateSalespersonStatus(id, status) {
  await delay(400)
  salespeople = salespeople.map((person) =>
    person.id === id
      ? { ...person, status, lastActive: 'Just now' }
      : person,
  )
  if (id === 'sp_001') writeStoredStatus(status)
  return structuredClone(salespeople.find((person) => person.id === id))
}

export async function getSalespersonStats() {
  await delay(250)
  return { ...salespersonPortalStats }
}

function withPipeline(lead) {
  if (!lead) return lead
  const stored = getStoredLead(lead.id)
  return classifyLead({
    ...lead,
    source: lead.source || stored?.source,
    pipelineType: stored?.pipelineType || lead.pipelineType,
  })
}

export async function getMyLeads(salespersonId = 'sp_001') {
  await delay(300)
  return structuredClone(
    myLeads
      .filter((lead) => lead.salespersonId === salespersonId)
      .map(withPipeline),
  )
}

export async function getMyLeadById(id) {
  await delay(250)
  const lead = myLeads.find((item) => item.id === id)
  return lead ? structuredClone(withPipeline(lead)) : null
}

export function pushLeadActivity(leadId, description, actor = 'John Smith') {
  if (!leadId) return null
  myLeads = myLeads.map((lead) =>
    lead.id === leadId
      ? {
          ...lead,
          activity: [
            {
              id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              description,
              actor,
              time: 'Just now',
            },
            ...(lead.activity || []),
          ],
        }
      : lead,
  )
  rebindSp()
  return myLeads.find((lead) => lead.id === leadId) || null
}

export async function updateMyLeadStatus(id, status) {
  await delay(550)
  myLeads = myLeads.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          status,
          activity: [
            {
              id: `act_${Date.now()}`,
              description: `Lead status changed to ${status}`,
              actor: 'John Smith',
              time: 'Just now',
            },
            ...(lead.activity || []),
          ],
        }
      : lead,
  )
  rebindSp()
  syncSpStatusToPlatform(id, status)
  return structuredClone(myLeads.find((lead) => lead.id === id))
}

export async function addMyLeadNote(id, note) {
  await delay(500)
  const entry = {
    id: `note_${Date.now()}`,
    text: note,
    author: 'John Smith',
    time: 'Just now',
  }
  myLeads = myLeads.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          notes: [entry, ...(lead.notes || [])],
          activity: [
            {
              id: `act_${Date.now()}`,
              description: `Note added: ${note}`,
              actor: 'John Smith',
              time: 'Just now',
            },
            ...(lead.activity || []),
          ],
        }
      : lead,
  )
  return structuredClone(myLeads.find((lead) => lead.id === id))
}

export async function acceptIncomingLead(id, offerPayload = null) {
  await delay(500)
  const existing = myLeads.find((lead) => lead.id === id)
  if (!existing && offerPayload) {
    myLeads = [
      {
        id: offerPayload.id,
        customerName: offerPayload.customerName,
        phone: offerPayload.phone || '',
        email: offerPayload.email || '',
        vehicle: offerPayload.vehicle,
        budget: offerPayload.budget,
        timeline: offerPayload.timeline,
        location: offerPayload.location,
        financing: offerPayload.financing,
        score: offerPayload.score,
        tier: offerPayload.tier,
        status: 'NEW',
        offerStatus: 'ACCEPTED',
        dealership: offerPayload.dealership,
        salespersonId: 'sp_001',
        createdLabel: 'Today',
        notes: [],
        activity: [
          {
            id: `act_${Date.now()}`,
            description: 'Lead accepted',
            actor: 'John Smith',
            time: 'Just now',
          },
        ],
      },
      ...myLeads,
    ]
    rebindSp()
    syncAfterAccept(id)
    return structuredClone(myLeads[0])
  }

  myLeads = myLeads.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          offerStatus: 'ACCEPTED',
          status: 'NEW',
          activity: [
            {
              id: `act_${Date.now()}`,
              description: 'Lead accepted',
              actor: 'John Smith',
              time: 'Just now',
            },
            ...(lead.activity || []),
          ],
        }
      : lead,
  )
  rebindSp()
  syncAfterAccept(id)
  return structuredClone(myLeads.find((lead) => lead.id === id))
}

export async function declineIncomingLead(id) {
  await delay(500)
  myLeads = myLeads.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          offerStatus: 'DECLINED',
          activity: [
            {
              id: `act_${Date.now()}`,
              description: 'Lead declined',
              actor: 'John Smith',
              time: 'Just now',
            },
            ...(lead.activity || []),
          ],
        }
      : lead,
  )
  rebindSp()
  syncAfterDecline(id)
  return structuredClone(
    myLeads.find((lead) => lead.id === id) || { id, offerStatus: 'DECLINED' },
  )
}

const salespersonService = {
  getSalespeople,
  getSalespersonById,
  getCurrentSalesperson,
  updateSalespersonStatus,
  getSalespersonStats,
  getMyLeads,
  getMyLeadById,
  updateMyLeadStatus,
  pushLeadActivity,
  addMyLeadNote,
  acceptIncomingLead,
  declineIncomingLead,
}

export default salespersonService
