import { delay } from '../../utils/delay'
import { initialLifeEvents } from '../../data/lifeEvents'

let events = structuredClone(initialLifeEvents)

export async function getLifeEvents() {
  await delay(300)
  return structuredClone(events)
}

export async function getLifeEventById(id) {
  await delay(220)
  const item = events.find((e) => e.id === id)
  return item ? structuredClone(item) : null
}

export async function dismissLifeEvent(id) {
  await delay(400)
  events = events.map((e) =>
    e.id === id ? { ...e, status: 'DISMISSED' } : e,
  )
  return structuredClone(events.find((e) => e.id === id))
}

export async function markLifeEventLeadCreated(id, leadId) {
  await delay(300)
  events = events.map((e) =>
    e.id === id ? { ...e, status: 'LEAD CREATED', leadId } : e,
  )
  return structuredClone(events.find((e) => e.id === id))
}

const lifeEventService = {
  getLifeEvents,
  getLifeEventById,
  dismissLifeEvent,
  markLifeEventLeadCreated,
}

export default lifeEventService
