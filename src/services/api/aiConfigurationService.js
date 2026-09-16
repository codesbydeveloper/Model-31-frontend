import { apiRequest } from './http'
import { extractItem, extractList, textValue } from './payload'

function boolValue(value, fallback = false) {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === 'on' || normalized === '1') return true
    if (normalized === 'false' || normalized === 'off' || normalized === '0') return false
  }
  return fallback
}

function mapConversation(raw = {}) {
  return {
    aiEnabled: boolValue(raw.aiEnabled, true),
    automaticResponses: boolValue(raw.automaticResponses, true),
    languageDetection: boolValue(raw.languageDetection, true),
    english: boolValue(raw.english, true),
    spanish: boolValue(raw.spanish, true),
    tone: textValue(raw.tone, 'Professional'),
    responseStyle: textValue(raw.responseStyle, 'Balanced'),
  }
}

function mapQualification(raw = {}) {
  return {
    budget: boolValue(raw.budget, true),
    desiredVehicle: boolValue(raw.desiredVehicle, true),
    buyingTimeline: boolValue(raw.buyingTimeline, true),
    location: boolValue(raw.location, true),
    financingPreference: boolValue(raw.financingPreference, true),
  }
}

function mapBehavior(raw = {}) {
  return {
    conversationAi: boolValue(raw.conversationAi, true),
    leadQualification: boolValue(raw.leadQualification, true),
    automaticLeadRouting: boolValue(raw.automaticLeadRouting, true),
    aiContentGeneration: boolValue(raw.aiContentGeneration, true),
    aiFollowUp: boolValue(raw.aiFollowUp, true),
    appointmentAssistance: boolValue(raw.appointmentAssistance, true),
  }
}

export function mapAiConfiguration(payload) {
  const raw = extractItem(payload, ['aiConfiguration', 'config']) || payload || {}
  const options = raw.options || payload.options || {}
  return {
    conversationAi: mapConversation(raw.conversationAi || raw.conversation),
    leadQualification: mapQualification(raw.leadQualification || raw.qualification),
    aiBehavior: mapBehavior(raw.aiBehavior || raw.behavior),
    options: {
      tones: extractList(options, ['tones']).map((item) => textValue(item)).filter(Boolean),
      responseStyles: extractList(options, ['responseStyles']).map((item) => textValue(item)).filter(Boolean),
    },
  }
}

function toApiPayload(config) {
  return {
    conversationAi: mapConversation(config.conversationAi),
    leadQualification: mapQualification(config.leadQualification),
    aiBehavior: mapBehavior(config.aiBehavior),
  }
}

export async function getAiConfiguration() {
  const payload = await apiRequest('/api/ai-configuration')
  return mapAiConfiguration(payload)
}

export async function saveAiConfiguration(config) {
  const payload = await apiRequest('/api/ai-configuration', {
    method: 'PUT',
    body: toApiPayload(config),
  })
  return mapAiConfiguration(payload)
}

const aiConfigurationService = {
  getAiConfiguration,
  saveAiConfiguration,
}

export default aiConfigurationService
