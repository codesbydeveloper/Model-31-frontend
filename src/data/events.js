export const EVENT_TYPES = [
  'LEAD_CREATED',
  'LEAD_QUALIFIED',
  'LEAD_ROUTED',
  'MESSAGE_RECEIVED',
  'APPOINTMENT_CREATED',
  'CRM_SYNC',
  'SOCIAL_POST',
  'DEAL_SOLD',
]

export const EVENT_STATUSES = ['PROCESSED', 'PENDING', 'FAILED']

export const initialEvents = Array.from({ length: 36 }, (_, i) => {
  const type = EVENT_TYPES[i % EVENT_TYPES.length]
  const status = EVENT_STATUSES[i % EVENT_STATUSES.length]
  const sources = ['Website', 'AI Engine', 'Dispatch', 'CRM', 'Marketing', 'Salesperson Portal']
  const entities = ['LEAD-2048', 'LEAD-2053', 'APT-001', 'CUST-001', 'POST-042', 'DEAL-001']
  const hour = 8 + (i % 10)
  const minute = String((i * 7) % 60).padStart(2, '0')
  return {
    id: `evt_${String(1000 + i)}`,
    eventType: type,
    source: sources[i % sources.length],
    entity: entities[i % entities.length],
    status,
    created: `2026-08-14 ${String(hour).padStart(2, '0')}:${minute}`,
    processed: status === 'PENDING' ? null : `2026-08-14 ${String(hour).padStart(2, '0')}:${String(Number(minute) + 2).padStart(2, '0')}`,
    durationMs: status === 'PENDING' ? null : 120 + (i % 20) * 45,
    payloadSummary: `${type.replaceAll('_', ' ').toLowerCase()} for ${entities[i % entities.length]}`,
  }
})
