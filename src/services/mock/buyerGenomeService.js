import { delay } from '../../utils/delay'
import { initialBuyerGenomes } from '../../data/buyerGenome'
import { initialBuyerBehaviorSignals } from '../../data/buyerBehaviorSignals'

const genomes = structuredClone(initialBuyerGenomes)
const signals = structuredClone(initialBuyerBehaviorSignals)

export async function getBuyerGenome(leadId) {
  await delay(220)
  const genome = genomes.find((item) => item.leadId === leadId)
  return genome ? structuredClone(genome) : null
}

export async function getBuyerGenomes() {
  await delay(250)
  return structuredClone(genomes)
}

export async function getBehaviorSignals(leadId) {
  await delay(200)
  if (!leadId) return structuredClone(signals)
  return structuredClone(signals.filter((item) => item.leadId === leadId))
}

const buyerGenomeService = {
  getBuyerGenome,
  getBuyerGenomes,
  getBehaviorSignals,
}

export default buyerGenomeService
