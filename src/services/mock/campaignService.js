import { delay } from '../../utils/delay'
import { initialCampaigns } from '../../data/campaigns'

let campaigns = structuredClone(initialCampaigns)

export async function getCampaigns() {
  await delay(300)
  return structuredClone(campaigns)
}

export async function getCampaignById(id) {
  await delay(250)
  const item = campaigns.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

export async function createCampaign(payload) {
  await delay(600)
  const item = {
    id: `camp_${Date.now()}`,
    name: payload.name,
    dealership: payload.dealership,
    objective: payload.objective,
    platforms: payload.platforms || [],
    startDate: payload.startDate,
    endDate: payload.endDate,
    budget: Number(payload.budget) || 0,
    contentCount: 0,
    leads: 0,
    status: 'DRAFT',
    audience: payload.audience || 'Luxury Buyer',
    description: payload.description || '',
    stats: { reach: 0, engagement: 0, leads: 0, appointments: 0, soldDeals: 0 },
  }
  campaigns = [item, ...campaigns]
  return structuredClone(item)
}

export async function updateCampaign(id, payload) {
  await delay(450)
  const index = campaigns.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Campaign not found')
  campaigns[index] = { ...campaigns[index], ...payload, id }
  return structuredClone(campaigns[index])
}

const campaignService = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
}

export default campaignService
