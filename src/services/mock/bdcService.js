import { delay } from '../../utils/delay'
import {
  bdcStats,
  getPriority,
  initialBdcLeads,
  initialBdcQueue,
} from '../../data/bdcQueue'
import { initialSalespeople } from '../../data/salespeople'
import { registerLeadArrays, syncAfterBdcAssign, getStoredLead } from './leadStore'
import { isDealershipLead, classifyLead } from '../../utils/pipeline'

let queue = structuredClone(initialBdcQueue)
let bdcLeads = structuredClone(initialBdcLeads)
let salespeople = structuredClone(initialSalespeople)

registerLeadArrays({ bdcQueue: queue, bdcLeads })

function rebindRefs() {
  registerLeadArrays({ bdcQueue: queue, bdcLeads })
}

function formatWait(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function prioritize(list) {
  const tierRank = { A: 0, B: 1, C: 2 }
  return [...list].sort((a, b) => {
    const t = (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9)
    if (t !== 0) return t
    if (b.score !== a.score) return b.score - a.score
    return b.waitSeconds - a.waitSeconds
  })
}

export async function getBDCStats() {
  await delay(300)
  return {
    ...bdcStats,
    waitingForAssignment: queue.filter((q) => q.status === 'WAITING').length,
  }
}

function isDealershipQueueItem(item) {
  const stored = getStoredLead(item.id)
  return isDealershipLead(stored || item)
}

export async function getQueue() {
  await delay(320)
  return prioritize(
    queue
      .filter((item) => item.status === 'WAITING' && isDealershipQueueItem(item))
      .map((item) => {
        const stored = getStoredLead(item.id)
        const classified = classifyLead(stored || item)
        return {
          ...item,
          waitTime: formatWait(item.waitSeconds),
          priority: getPriority(item.tier),
          pipelineType: classified.pipelineType,
          classificationStatus: classified.classificationStatus,
          source: classified.source || item.source || 'CRM',
        }
      }),
  )
}

export async function getBdcLeads() {
  await delay(300)
  return structuredClone(
    bdcLeads
      .filter((item) => isDealershipQueueItem(item))
      .map((item) => {
        const stored = getStoredLead(item.id)
        const classified = classifyLead(stored || item)
        return {
          ...item,
          priority: getPriority(item.tier),
          pipelineType: classified.pipelineType,
          classificationStatus: classified.classificationStatus,
          source: classified.source || item.source || 'CRM',
        }
      }),
  )
}

export async function assignLead(leadId, salesperson) {
  await delay(700)
  queue = queue.map((item) =>
    item.id === leadId
      ? {
          ...item,
          status: 'ASSIGNED',
          salesperson: salesperson.name,
          salespersonId: salesperson.id,
        }
      : item,
  )

  const existing = bdcLeads.find((item) => item.id === leadId)
  if (existing) {
    bdcLeads = bdcLeads.map((item) =>
      item.id === leadId
        ? {
            ...item,
            status: 'ASSIGNED',
            bdcStatus: 'ASSIGNED',
            salesperson: salesperson.name,
            salespersonId: salesperson.id,
            responseTime: 'Pending',
          }
        : item,
    )
  } else {
    const fromQueue = queue.find((item) => item.id === leadId)
    if (fromQueue) {
      bdcLeads = [
        {
          ...fromQueue,
          status: 'ASSIGNED',
          bdcStatus: 'ASSIGNED',
          salesperson: salesperson.name,
          salespersonId: salesperson.id,
          responseTime: 'Pending',
        },
        ...bdcLeads,
      ]
    }
  }

  salespeople = salespeople.map((person) =>
    person.id === salesperson.id
      ? { ...person, currentLeads: person.currentLeads + 1 }
      : person,
  )

  rebindRefs()
  syncAfterBdcAssign(leadId, salesperson)

  return structuredClone({
    leadId,
    salesperson,
    status: 'ASSIGNED',
  })
}

export async function reassignLead(leadId, salesperson) {
  await delay(700)
  bdcLeads = bdcLeads.map((item) =>
    item.id === leadId
      ? {
          ...item,
          status: 'ASSIGNED',
          bdcStatus: 'ASSIGNED',
          salesperson: salesperson.name,
          salespersonId: salesperson.id,
        }
      : item,
  )
  queue = queue.map((item) =>
    item.id === leadId
      ? {
          ...item,
          status: 'ASSIGNED',
          salesperson: salesperson.name,
          salespersonId: salesperson.id,
        }
      : item,
  )
  rebindRefs()
  syncAfterBdcAssign(leadId, salesperson)
  return structuredClone({ leadId, salesperson })
}

export async function escalateLead(leadId, reason = 'System escalation') {
  await delay(500)
  bdcLeads = bdcLeads.map((item) =>
    item.id === leadId
      ? { ...item, status: 'ESCALATED', bdcStatus: 'ESCALATED' }
      : item,
  )
  return { leadId, reason, status: 'ESCALATED' }
}

export async function enqueueQualifiedLead(lead) {
  await delay(200)
  if (!isDealershipLead(lead)) {
    return null
  }
  const existing = queue.find((item) => item.id === lead.id)
  if (existing) {
    return structuredClone(existing)
  }
  const score = Number(lead.score) || 70
  const tier = score >= 80 ? 'A' : score >= 40 ? 'B' : 'C'
  const row = {
    id: lead.id,
    customerName: lead.customerName,
    vehicle: lead.vehicle,
    score,
    tier,
    location: lead.location || lead.city || 'Miami',
    dealership: lead.dealership || 'Miami Luxury Motors',
    created: 'Just now',
    waitSeconds: 30,
    status: 'WAITING',
    budget: lead.budget || '',
    timeline: lead.timeline || '',
    financing: lead.financing || '',
  }
  queue = [row, ...queue]
  const bdcRow = {
    ...row,
    status: 'WAITING',
    bdcStatus: 'WAITING',
    salesperson: 'Unassigned',
    salespersonId: null,
    responseTime: '—',
  }
  bdcLeads = [bdcRow, ...bdcLeads]
  rebindRefs()
  return structuredClone(row)
}

export async function getSalespeopleAvailability() {
  await delay(250)
  return structuredClone(salespeople)
}

const bdcService = {
  getBDCStats,
  getQueue,
  getBdcLeads,
  assignLead,
  reassignLead,
  escalateLead,
  enqueueQualifiedLead,
  getSalespeopleAvailability,
}

export default bdcService
