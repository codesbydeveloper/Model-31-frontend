import { delay } from '../../utils/delay'
import { initialDealerships } from '../../data/dealerships'

let dealerships = structuredClone(initialDealerships)

function nextId() {
  return `dlr_${String(Date.now()).slice(-6)}`
}

export async function getDealerships() {
  await delay(350)
  return structuredClone(dealerships)
}

export async function getDealershipById(id) {
  await delay(300)
  const item = dealerships.find((d) => d.id === id)
  return item ? structuredClone(item) : null
}

export async function createDealership(payload) {
  await delay(700)
  const brands = Array.isArray(payload.brands)
    ? payload.brands
    : String(payload.brands || '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)

  const created = {
    id: nextId(),
    name: payload.name,
    address: payload.address || '',
    city: payload.city,
    state: payload.state,
    zip: payload.zip || '',
    phone: payload.phone || '',
    website: payload.website || '',
    brands,
    timezone: payload.timezone || 'America/New_York',
    status: payload.status || 'Active',
    salespeople: Number(payload.salespeople) || 0,
    activeLeads: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    routedLeads: 0,
    closedDeals: 0,
    conversionRate: 0,
    crmStatus: 'Disconnected',
    socialStatus: 'Disconnected',
  }

  dealerships = [created, ...dealerships]
  return structuredClone(created)
}

export async function updateDealership(id, payload) {
  await delay(650)
  const index = dealerships.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Dealership not found')

  const brands = Array.isArray(payload.brands)
    ? payload.brands
    : String(payload.brands || '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)

  dealerships[index] = {
    ...dealerships[index],
    ...payload,
    brands,
    id,
  }

  return structuredClone(dealerships[index])
}

export async function toggleDealershipStatus(id) {
  await delay(500)
  const index = dealerships.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Dealership not found')
  const next =
    dealerships[index].status === 'Active' ? 'Inactive' : 'Active'
  dealerships[index] = { ...dealerships[index], status: next }
  return structuredClone(dealerships[index])
}

export async function deleteDealership(id) {
  await delay(500)
  dealerships = dealerships.filter((d) => d.id !== id)
  return true
}

const dealershipService = {
  getDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  toggleDealershipStatus,
  deleteDealership,
}

export default dealershipService
