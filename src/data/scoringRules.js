export const initialScoringRules = {
  weights: {
    budget: 20,
    vehicle: 20,
    timeline: 20,
    location: 20,
    financing: 20,
  },
  tiers: {
    a: { min: 80, max: 100 },
    b: { min: 40, max: 79 },
    c: { min: 0, max: 39 },
  },
  lifecycle: ['NEW', 'QUALIFYING', 'QUALIFIED', 'ROUTED', 'CLOSED'],
}
