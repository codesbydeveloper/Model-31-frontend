import { delay } from '../../utils/delay'
import { initialCities } from '../../data/cities'

let cities = structuredClone(initialCities)

function nextId() {
  return `city_${String(Date.now()).slice(-6)}`
}

export async function getCities() {
  await delay(300)
  return structuredClone(cities)
}

export async function createCity(payload) {
  await delay(650)
  const created = {
    id: nextId(),
    city: payload.city,
    state: payload.state,
    country: payload.country || 'USA',
    primaryLanguage: payload.primaryLanguage || 'English',
    secondaryLanguage: payload.secondaryLanguage || '',
    regionalTone: payload.regionalTone || 'Professional',
    inventoryFocus: payload.inventoryFocus || '',
    financingFocus: payload.financingFocus || 'Financing',
    dealerships: Number(payload.dealerships) || 0,
    status: payload.status || 'Active',
  }
  cities = [created, ...cities]
  return structuredClone(created)
}

export async function updateCity(id, payload) {
  await delay(600)
  const index = cities.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('City not found')
  cities[index] = { ...cities[index], ...payload, id }
  return structuredClone(cities[index])
}

export async function deleteCity(id) {
  await delay(500)
  cities = cities.filter((c) => c.id !== id)
  return true
}

const cityService = {
  getCities,
  createCity,
  updateCity,
  deleteCity,
}

export default cityService
