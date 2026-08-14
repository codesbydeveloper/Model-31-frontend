import { delay } from '../../utils/delay'
import { initialPersonas } from '../../data/personas'

let personas = structuredClone(initialPersonas)

function nextId() {
  return `persona_${String(Date.now()).slice(-6)}`
}

export async function getPersonas() {
  await delay(300)
  return structuredClone(personas)
}

export async function createPersona(payload) {
  await delay(650)
  const created = {
    id: nextId(),
    name: payload.name,
    description: payload.description || '',
    minBudget: Number(payload.minBudget) || 0,
    maxBudget: Number(payload.maxBudget) || 0,
    vehiclePreference: payload.vehiclePreference || '',
    buyingTimeline: payload.buyingTimeline || '',
    financingPreference: payload.financingPreference || '',
    language: payload.language || 'English',
    status: payload.status || 'Active',
  }
  personas = [created, ...personas]
  return structuredClone(created)
}

export async function updatePersona(id, payload) {
  await delay(600)
  const index = personas.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Persona not found')
  personas[index] = {
    ...personas[index],
    ...payload,
    minBudget: Number(payload.minBudget),
    maxBudget: Number(payload.maxBudget),
    id,
  }
  return structuredClone(personas[index])
}

export async function deletePersona(id) {
  await delay(500)
  personas = personas.filter((p) => p.id !== id)
  return true
}

const personaService = {
  getPersonas,
  createPersona,
  updatePersona,
  deletePersona,
}

export default personaService
