import { delay } from '../../utils/delay'
import {
  intentStats,
  intentKeywords,
  initialIntentSignals,
  initialBudgetSignals,
} from '../../data/intentSignals'

let intents = structuredClone(initialIntentSignals)
let budgets = structuredClone(initialBudgetSignals)

export async function getIntentSignals() {
  await delay(300)
  return {
    stats: { ...intentStats },
    keywords: structuredClone(intentKeywords),
    signals: structuredClone(intents),
  }
}

export async function getBudgetSignals() {
  await delay(250)
  return structuredClone(budgets)
}

export async function getIntentById(id) {
  await delay(200)
  const item = intents.find((i) => i.id === id)
  return item ? structuredClone(item) : null
}

const intentService = {
  getIntentSignals,
  getBudgetSignals,
  getIntentById,
}

export default intentService
