export function bandFromScore(score) {
  if (score >= 0.67) return 'HIGH'
  if (score >= 0.34) return 'MEDIUM'
  return 'LOW'
}

const PROFILES = [
  { leadId: 'LEAD-2048', customerName: 'Sarah Johnson', urgency: 0.82, budgetSensitivity: 0.71, hesitation: 0.24, riskTolerance: 0.55, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2049', customerName: 'Marcus Lee', urgency: 0.61, budgetSensitivity: 0.48, hesitation: 0.39, riskTolerance: 0.62, tone: 'WARM', length: 'MEDIUM', timing: 'EVENING', intent: 'MEDIUM' },
  { leadId: 'LEAD-2050', customerName: 'Elena Vargas', urgency: 0.74, budgetSensitivity: 0.66, hesitation: 0.31, riskTolerance: 0.44, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2051', customerName: 'James Carter', urgency: 0.29, budgetSensitivity: 0.81, hesitation: 0.72, riskTolerance: 0.22, tone: 'CONSULTATIVE', length: 'LONG', timing: 'WEEKEND', intent: 'LOW' },
  { leadId: 'LEAD-2052', customerName: 'Priya Patel', urgency: 0.58, budgetSensitivity: 0.52, hesitation: 0.41, riskTolerance: 0.6, tone: 'WARM', length: 'MEDIUM', timing: 'ACTIVE WINDOW', intent: 'MEDIUM' },
  { leadId: 'LEAD-2053', customerName: 'Robert Hayes', urgency: 0.88, budgetSensitivity: 0.33, hesitation: 0.18, riskTolerance: 0.79, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2054', customerName: 'Aisha Khan', urgency: 0.47, budgetSensitivity: 0.69, hesitation: 0.51, riskTolerance: 0.4, tone: 'WARM', length: 'MEDIUM', timing: 'EVENING', intent: 'MEDIUM' },
  { leadId: 'LEAD-2055', customerName: 'Daniel Brooks', urgency: 0.7, budgetSensitivity: 0.45, hesitation: 0.28, riskTolerance: 0.67, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2056', customerName: 'Sofia Ramirez', urgency: 0.76, budgetSensitivity: 0.38, hesitation: 0.22, riskTolerance: 0.71, tone: 'WARM', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2057', customerName: 'Kevin Nguyen', urgency: 0.33, budgetSensitivity: 0.77, hesitation: 0.64, riskTolerance: 0.31, tone: 'CONSULTATIVE', length: 'LONG', timing: 'WEEKEND', intent: 'LOW' },
  { leadId: 'LEAD-2058', customerName: 'Emily Chen', urgency: 0.81, budgetSensitivity: 0.58, hesitation: 0.19, riskTolerance: 0.5, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2059', customerName: 'Chris Thompson', urgency: 0.42, budgetSensitivity: 0.63, hesitation: 0.55, riskTolerance: 0.48, tone: 'WARM', length: 'MEDIUM', timing: 'EVENING', intent: 'MEDIUM' },
  { leadId: 'LEAD-2060', customerName: 'Natalie Gomez', urgency: 0.66, budgetSensitivity: 0.54, hesitation: 0.36, riskTolerance: 0.57, tone: 'WARM', length: 'MEDIUM', timing: 'ACTIVE WINDOW', intent: 'MEDIUM' },
  { leadId: 'LEAD-2061', customerName: 'Omar Hassan', urgency: 0.79, budgetSensitivity: 0.41, hesitation: 0.21, riskTolerance: 0.73, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2062', customerName: 'Lauren White', urgency: 0.26, budgetSensitivity: 0.84, hesitation: 0.78, riskTolerance: 0.19, tone: 'CONSULTATIVE', length: 'LONG', timing: 'WEEKEND', intent: 'LOW' },
  { leadId: 'LEAD-2063', customerName: 'Brian Foster', urgency: 0.91, budgetSensitivity: 0.29, hesitation: 0.12, riskTolerance: 0.82, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2064', customerName: 'Hannah Kim', urgency: 0.54, budgetSensitivity: 0.6, hesitation: 0.47, riskTolerance: 0.52, tone: 'WARM', length: 'MEDIUM', timing: 'EVENING', intent: 'MEDIUM' },
  { leadId: 'LEAD-2065', customerName: 'Peter Sullivan', urgency: 0.68, budgetSensitivity: 0.5, hesitation: 0.33, riskTolerance: 0.61, tone: 'DIRECT', length: 'MEDIUM', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
  { leadId: 'LEAD-2066', customerName: 'Mia Torres', urgency: 0.37, budgetSensitivity: 0.72, hesitation: 0.59, riskTolerance: 0.35, tone: 'WARM', length: 'LONG', timing: 'WEEKEND', intent: 'LOW' },
  { leadId: 'LEAD-2073', customerName: 'Daniel Park', urgency: 0.84, budgetSensitivity: 0.46, hesitation: 0.2, riskTolerance: 0.64, tone: 'DIRECT', length: 'SHORT', timing: 'ACTIVE WINDOW', intent: 'HIGH' },
]

const TIMELINE_STEPS = [
  'Customer Viewed Vehicle',
  'Saved Content',
  'Returned to Profile',
  'Asked Price',
  'Asked Payment',
  'Replied to DM',
  'High Intent Detected',
]

export const initialBuyerGenomes = PROFILES.map((profile, index) => {
  const base = new Date('2026-08-17T08:00:00')
  return {
    id: `bg_${profile.leadId}`,
    ...profile,
    urgencyLabel: bandFromScore(profile.urgency),
    budgetSensitivityLabel: bandFromScore(profile.budgetSensitivity),
    hesitationLabel: bandFromScore(profile.hesitation),
    riskToleranceLabel: bandFromScore(profile.riskTolerance),
    reason:
      profile.intent === 'HIGH'
        ? 'Buyer shows strong purchase intent and prefers concise responses.'
        : profile.intent === 'MEDIUM'
          ? 'Buyer is comparing options and responds well to balanced detail.'
          : 'Buyer is early in research and benefits from a consultative tone.',
    suggestedResponse:
      profile.intent === 'HIGH'
        ? 'Absolutely. I can help with the payment options. Would you like me to show you the available choices?'
        : profile.intent === 'MEDIUM'
          ? 'Happy to help. I can walk through the vehicle, payment range, and next steps whenever you are ready.'
          : 'No rush. I can share a short overview of the vehicle and answer questions as they come up.',
    timeline: TIMELINE_STEPS.map((label, step) => {
      const t = new Date(base.getTime() + (index % 5) * 3600000 + step * 18 * 60000)
      return {
        id: `${profile.leadId}-tl-${step}`,
        label,
        timestamp: t.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      }
    }),
  }
})
