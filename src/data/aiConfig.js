export const initialAiConfig = {
  conversation: {
    aiEnabled: true,
    automaticResponses: true,
    languageDetection: true,
    english: true,
    spanish: true,
    tone: 'Professional',
    responseStyle: 'Balanced',
  },
  qualification: {
    budget: true,
    desiredVehicle: true,
    buyingTimeline: true,
    location: true,
    financingPreference: true,
  },
  behavior: {
    conversationAi: true,
    leadQualification: true,
    automaticLeadRouting: true,
    aiContentGeneration: true,
    aiFollowUp: true,
    appointmentAssistance: true,
  },
}

export const AI_TONES = ['Professional', 'Friendly', 'Casual', 'Luxury', 'Concise']
export const AI_RESPONSE_STYLES = ['Short', 'Balanced', 'Detailed']
