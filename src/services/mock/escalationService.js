import { delay } from '../../utils/delay'
import { initialEscalations } from '../../data/escalations'

let escalations = structuredClone(initialEscalations)

export async function getEscalations() {
  await delay(300)
  return structuredClone(escalations)
}

export async function resolveEscalation(id) {
  await delay(600)
  escalations = escalations.map((item) =>
    item.id === id ? { ...item, status: 'RESOLVED' } : item,
  )
  return structuredClone(escalations.find((item) => item.id === id))
}

const escalationService = {
  getEscalations,
  resolveEscalation,
}

export default escalationService
