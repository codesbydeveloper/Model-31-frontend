import { delay } from '../../utils/delay'
import { initialAiConfig } from '../../data/aiConfig'
import { initialScoringRules } from '../../data/scoringRules'
import { initialPlatformSettings } from '../../data/settings'

let aiConfig = structuredClone(initialAiConfig)
let scoringRules = structuredClone(initialScoringRules)
let platformSettings = structuredClone(initialPlatformSettings)

export async function getAiConfig() {
  await delay(300)
  return structuredClone(aiConfig)
}

export async function saveAiConfig(payload) {
  await delay(800)
  aiConfig = structuredClone(payload)
  return structuredClone(aiConfig)
}

export async function getScoringRules() {
  await delay(300)
  return structuredClone(scoringRules)
}

export async function saveScoringRules(payload) {
  await delay(800)
  scoringRules = structuredClone(payload)
  return structuredClone(scoringRules)
}

export async function getPlatformSettings() {
  await delay(300)
  return structuredClone(platformSettings)
}

export async function savePlatformSettings(payload) {
  await delay(800)
  platformSettings = structuredClone(payload)
  return structuredClone(platformSettings)
}

const settingsService = {
  getAiConfig,
  saveAiConfig,
  getScoringRules,
  saveScoringRules,
  getPlatformSettings,
  savePlatformSettings,
}

export default settingsService
