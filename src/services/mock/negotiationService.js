import { delay } from '../../utils/delay'
import { initialNegotiationLimits } from '../../data/negotiationLimits'
import { initialNegotiationTemplates } from '../../data/negotiationTemplates'

let limits = structuredClone(initialNegotiationLimits)
let templates = structuredClone(initialNegotiationTemplates)

export async function getNegotiationLimits() {
  await delay(250)
  return structuredClone(limits)
}

export async function getNegotiationLimit(id) {
  await delay(220)
  const item = limits.find((row) => row.id === id)
  return item ? structuredClone(item) : null
}

export async function updateNegotiationLimits(id, payload) {
  await delay(450)
  const index = limits.findIndex((row) => row.id === id)
  if (index === -1) throw new Error('Negotiation limit not found')
  limits[index] = { ...limits[index], ...payload, id }
  return structuredClone(limits[index])
}

export async function getNegotiationTemplates() {
  await delay(240)
  return structuredClone(templates)
}

export async function getNegotiationTemplate(id) {
  await delay(200)
  const item = templates.find((row) => row.id === id)
  return item ? structuredClone(item) : null
}

export async function createNegotiationTemplate(payload) {
  await delay(500)
  const created = {
    id: `tpl_${Date.now()}`,
    vehicleCount: 0,
    assignedVins: [],
    lastUpdated: 'Just now',
    status: 'ACTIVE',
    ...payload,
  }
  templates = [created, ...templates]
  return structuredClone(created)
}

export async function updateNegotiationTemplate(id, payload) {
  await delay(450)
  const index = templates.findIndex((row) => row.id === id)
  if (index === -1) throw new Error('Template not found')
  templates[index] = {
    ...templates[index],
    ...payload,
    id,
    lastUpdated: 'Just now',
  }
  return structuredClone(templates[index])
}

export async function duplicateNegotiationTemplate(id) {
  await delay(400)
  const source = templates.find((row) => row.id === id)
  if (!source) throw new Error('Template not found')
  const copy = {
    ...source,
    id: `tpl_${Date.now()}`,
    name: `${source.name} Copy`,
    vehicleCount: 0,
    assignedVins: [],
    lastUpdated: 'Just now',
    status: 'ACTIVE',
  }
  templates = [copy, ...templates]
  return structuredClone(copy)
}

const negotiationService = {
  getNegotiationLimits,
  getNegotiationLimit,
  updateNegotiationLimits,
  getNegotiationTemplates,
  getNegotiationTemplate,
  createNegotiationTemplate,
  updateNegotiationTemplate,
  duplicateNegotiationTemplate,
}

export default negotiationService
