import { delay } from '../../utils/delay'
import {
  bdcStats,
  getPriority,
  initialBdcLeads,
  initialBdcQueue,
} from '../../data/bdcQueue'
import { initialSalespeople } from '../../data/salespeople'
import { registerLeadArrays, syncAfterBdcAssign } from './leadStore'

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

export async function getQueue() {
  await delay(320)
  return prioritize(
    queue
      .filter((item) => item.status === 'WAITING')
      .map((item) => ({
        ...item,
        waitTime: formatWait(item.waitSeconds),
        priority: getPriority(item.tier),
      })),
  )
}

export async function getBdcLeads() {
  await delay(300)
  return structuredClone(
    bdcLeads.map((item) => ({
      ...item,
      priority: getPriority(item.tier),
    })),
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
  getSalespeopleAvailability,
}

export default bdcService
