import { delay } from '../../utils/delay'
import { initialDealHandoffs } from '../../data/dealHandoffs'

let handoffs = structuredClone(initialDealHandoffs)

export async function getDealHandoffs() {
  await delay(260)
  return structuredClone(handoffs)
}

export async function getDealHandoff(id) {
  await delay(220)
  const item = handoffs.find((row) => row.id === id)
  return item ? structuredClone(item) : null
}

export async function getDealHandoffByLeadId(leadId) {
  await delay(180)
  const item = handoffs.find((row) => row.leadId === leadId)
  return item ? structuredClone(item) : null
}

export async function updateDealHandoff(id, payload) {
  await delay(420)
  const index = handoffs.findIndex((row) => row.id === id)
  if (index === -1) throw new Error('Handoff not found')
  handoffs[index] = { ...handoffs[index], ...payload, id }
  return structuredClone(handoffs[index])
}

const dealHandoffService = {
  getDealHandoffs,
  getDealHandoff,
  getDealHandoffByLeadId,
  updateDealHandoff,
}

export default dealHandoffService
