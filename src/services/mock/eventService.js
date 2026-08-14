import { delay } from '../../utils/delay'
import { initialEvents } from '../../data/events'

let events = structuredClone(initialEvents)

export async function getEvents() {
  await delay(300)
  return structuredClone(events)
}

export async function getEventById(id) {
  await delay(220)
  const item = events.find((e) => e.id === id)
  return item ? structuredClone(item) : null
}

const eventService = {
  getEvents,
  getEventById,
}

export default eventService
