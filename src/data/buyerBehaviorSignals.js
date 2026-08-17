const LEADS = [
  'LEAD-2048', 'LEAD-2049', 'LEAD-2050', 'LEAD-2051', 'LEAD-2052',
  'LEAD-2053', 'LEAD-2054', 'LEAD-2055', 'LEAD-2056', 'LEAD-2057',
  'LEAD-2058', 'LEAD-2059', 'LEAD-2060', 'LEAD-2061', 'LEAD-2062',
  'LEAD-2063', 'LEAD-2064', 'LEAD-2065', 'LEAD-2066', 'LEAD-2073',
]

function delayLabel(minutes) {
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export const initialBuyerBehaviorSignals = LEADS.flatMap((leadId, i) => {
  const current = {
    id: `sig_${leadId}_current`,
    leadId,
    period: 'Current',
    dmOpens: 6 + (i % 8),
    dmReplies: 3 + (i % 7),
    averageReplyDelay: delayLabel(1.2 + (i % 5) * 0.45),
    storyViews: 4 + (i % 9),
    storyReplays: i % 4,
    contentSaves: 2 + (i % 6),
    returnVisits: 1 + (i % 5),
    priceQuestions: i % 5,
    vehicleInterest: ['SUV', 'Sedan', 'Truck', 'EV'][i % 4],
  }
  const previous = {
    id: `sig_${leadId}_prior`,
    leadId,
    period: 'Prior 7 days',
    dmOpens: Math.max(1, current.dmOpens - 2),
    dmReplies: Math.max(0, current.dmReplies - 1),
    averageReplyDelay: delayLabel(2.1 + (i % 4) * 0.3),
    storyViews: Math.max(1, current.storyViews - 1),
    storyReplays: Math.max(0, current.storyReplays - 1),
    contentSaves: Math.max(0, current.contentSaves - 1),
    returnVisits: Math.max(0, current.returnVisits - 1),
    priceQuestions: Math.max(0, current.priceQuestions - 1),
    vehicleInterest: current.vehicleInterest,
  }
  return [current, previous]
})
