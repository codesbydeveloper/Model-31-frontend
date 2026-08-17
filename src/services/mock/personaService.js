import { delay } from '../../utils/delay'
import { initialAcquisitionPersonas } from '../../data/personas'

let personas = structuredClone(initialAcquisitionPersonas)

export async function getPersonas() {
  await delay(300)
  return structuredClone(personas)
}

export async function getPersonaById(id) {
  await delay(220)
  const item = personas.find((p) => p.id === id)
  return item ? structuredClone(item) : null
}

export async function createPersona(payload) {
  await delay(550)
  const item = {
    id: `pers_${Date.now()}`,
    name: payload.name,
    description: payload.description || '',
    audience: payload.targetAudience || payload.audience || '',
    targetAudience: payload.targetAudience || '',
    tone: payload.tone || 'Friendly',
    language: payload.language || 'English',
    primaryPlatform: payload.primaryPlatform || 'Instagram',
    platforms: [payload.primaryPlatform || 'Instagram'],
    engagement: 0,
    leads: 0,
    appointments: 0,
    sold: 0,
    status: payload.status || 'ACTIVE',
    followers: 0,
    dmInteractions: 0,
    storyInteractions: 0,
    returningVisitors: 0,
    intentSignals: 0,
    chartEngagement: [
      { name: 'W1', value: 0 },
      { name: 'W2', value: 0 },
      { name: 'W3', value: 0 },
      { name: 'W4', value: 0 },
    ],
    chartLeads: [
      { name: 'W1', value: 0 },
      { name: 'W2', value: 0 },
      { name: 'W3', value: 0 },
      { name: 'W4', value: 0 },
    ],
    chartConversion: [
      { name: 'W1', value: 0 },
      { name: 'W2', value: 0 },
      { name: 'W3', value: 0 },
      { name: 'W4', value: 0 },
    ],
  }
  personas = [item, ...personas]
  return structuredClone(item)
}

export async function updatePersona(id, payload) {
  await delay(450)
  personas = personas.map((p) => (p.id === id ? { ...p, ...payload } : p))
  return structuredClone(personas.find((p) => p.id === id))
}

export async function deletePersona(id) {
  await delay(400)
  personas = personas.filter((p) => p.id !== id)
  return true
}

const personaService = {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
}

export default personaService
