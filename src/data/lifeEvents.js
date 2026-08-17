export const LIFE_EVENT_TYPES = [
  'New Baby',
  'New Job',
  'Moving',
  'Vehicle Breakdown',
  'Growing Family',
  'Longer Commute',
  'New Driver',
  'Retirement',
]

export const LIFE_EVENT_STATUSES = ['NEW', 'REVIEWING', 'LEAD CREATED', 'DISMISSED']

const CUSTOMERS = [
  'Sarah Johnson',
  'Robert Hayes',
  'Chloe Bennett',
  'Brian Foster',
  'Priya Patel',
  'Marcus Lee',
  'Elena Vargas',
  'Aisha Khan',
  'Emily Chen',
  'Natalie Gomez',
  'Hannah Kim',
  'Tony Ricci',
  'Sofia Morales',
  'Lucas Rivera',
  'Olivia Brooks',
]

export const initialLifeEvents = CUSTOMERS.map((name, i) => {
  const event = LIFE_EVENT_TYPES[i % LIFE_EVENT_TYPES.length]
  return {
    id: `life_${String(i + 1).padStart(3, '0')}`,
    customerName: name,
    lifeEvent: event,
    detectedFrom: ['Customer Conversation', 'DM Signal', 'Platform Form', 'Follow-Up Reply'][i % 4],
    date: `Aug ${4 + (i % 11)}, 2026`,
    vehicleNeed: [
      'Needs reliable SUV',
      'Wants efficient commute vehicle',
      'Looking for family crossover',
      'Needs replacement vehicle soon',
      'Interested in EV options',
    ][i % 5],
    customerSignal: [
      'Mentioned relocating next month and needing more cargo space.',
      'Shared that commute increased and wants better MPG.',
      'Asked about 3-row seating for a growing household.',
      'Said current vehicle needs unexpected repairs.',
      'Asked about safe options for a new teen driver.',
    ][i % 5],
    intent: ['HIGH', 'MEDIUM', 'HIGH', 'MEDIUM', 'LOW'][i % 5],
    status: LIFE_EVENT_STATUSES[i % 3],
    leadId: i % 4 === 0 ? `LEAD-${2060 + i}` : null,
    dealership: 'Miami Luxury Motors',
  }
})
