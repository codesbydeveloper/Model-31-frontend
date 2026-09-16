import { apiRequest } from './http'

const DEFAULT_LIFECYCLE = ['NEW', 'QUALIFYING', 'QUALIFIED', 'ROUTED', 'CLOSED']

function unwrap(payload) {
  if (!payload || typeof payload !== 'object') return {}
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    if (payload.data.weights || payload.data.tiers) return payload.data
  }
  if (payload.weights || payload.tiers) return payload
  return payload.data && typeof payload.data === 'object' ? payload.data : payload
}

function num(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function mapTier(tier, fallback) {
  const source = tier && typeof tier === 'object' ? tier : fallback
  return {
    min: num(source?.min, fallback.min),
    max: num(source?.max, fallback.max),
  }
}

export function mapScoringRules(payload) {
  const data = unwrap(payload)
  const weights = data.weights || {}
  const tiers = data.tiers || {}

  const mappedWeights = {
    budget: num(weights.budget, 20),
    desiredVehicle: num(weights.desiredVehicle ?? weights.vehicle, 20),
    buyingTimeline: num(weights.buyingTimeline ?? weights.timeline, 20),
    location: num(weights.location, 20),
    financingPreference: num(weights.financingPreference ?? weights.financing, 20),
  }

  const mappedTiers = {
    tierA: mapTier(tiers.tierA || tiers.a, { min: 80, max: 100 }),
    tierB: mapTier(tiers.tierB || tiers.b, { min: 40, max: 79 }),
    tierC: mapTier(tiers.tierC || tiers.c, { min: 0, max: 39 }),
  }

  const computedTotal = Object.values(mappedWeights).reduce((sum, n) => sum + n, 0)

  return {
    weights: mappedWeights,
    tiers: mappedTiers,
    total: num(data.total, computedTotal),
    lifecycle: Array.isArray(data.lifecycle) && data.lifecycle.length
      ? data.lifecycle
      : DEFAULT_LIFECYCLE,
  }
}

function toApiPayload(rules) {
  return {
    weights: {
      budget: num(rules.weights.budget),
      desiredVehicle: num(rules.weights.desiredVehicle),
      buyingTimeline: num(rules.weights.buyingTimeline),
      location: num(rules.weights.location),
      financingPreference: num(rules.weights.financingPreference),
    },
    tiers: {
      tierA: {
        min: num(rules.tiers.tierA.min),
        max: num(rules.tiers.tierA.max),
      },
      tierB: {
        min: num(rules.tiers.tierB.min),
        max: num(rules.tiers.tierB.max),
      },
      tierC: {
        min: num(rules.tiers.tierC.min),
        max: num(rules.tiers.tierC.max),
      },
    },
  }
}

export async function getScoringRules() {
  const payload = await apiRequest('/api/scoring-rules')
  return mapScoringRules(payload)
}

export async function saveScoringRules(rules) {
  const payload = await apiRequest('/api/scoring-rules', {
    method: 'PUT',
    body: toApiPayload(rules),
  })
  return mapScoringRules(payload)
}

const scoringRulesService = {
  getScoringRules,
  saveScoringRules,
}

export default scoringRulesService
