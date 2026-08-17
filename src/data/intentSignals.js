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
  'Noah Patel',
  'Mia Torres',
  'Ethan Brooks',
  'Ava Martinez',
  'Mason Reed',
  'Harper Diaz',
  'Logan Scott',
  'Amelia Price',
  'Jackson Cole',
  'Charlotte Ruiz',
  'Benjamin Shaw',
  'Grace Kim',
  'Henry Walsh',
  'Isabella Cruz',
  'Liam Nguyen',
]

const PHRASES = [
  "I'm looking for an SUV around $600 per month.",
  'How much is the monthly payment on the RX?',
  'We need a car this weekend for the family.',
  'Can I finance with a small down payment?',
  'What lease options do you have under $700?',
  'I have a trade-in and want to know my budget.',
  'Looking for something around $40,000 max.',
  'Need reliable transportation after my move.',
]

export const INTENT_CATEGORIES = [
  'PRICE',
  'VEHICLE',
  'BUDGET',
  'TIMELINE',
  'FINANCING',
  'TRADE-IN',
]

export const intentKeywords = [
  { id: 'kw_01', keyword: 'how much', category: 'PRICE', occurrences: 86, customers: 54, intentLevel: 'HIGH', lastDetected: 'Aug 14, 2026' },
  { id: 'kw_02', keyword: 'payment', category: 'PRICE', occurrences: 72, customers: 48, intentLevel: 'HIGH', lastDetected: 'Aug 14, 2026' },
  { id: 'kw_03', keyword: 'SUV', category: 'VEHICLE', occurrences: 94, customers: 61, intentLevel: 'MEDIUM', lastDetected: 'Aug 14, 2026' },
  { id: 'kw_04', keyword: 'budget', category: 'BUDGET', occurrences: 68, customers: 42, intentLevel: 'HIGH', lastDetected: 'Aug 13, 2026' },
  { id: 'kw_05', keyword: 'looking', category: 'TIMELINE', occurrences: 110, customers: 77, intentLevel: 'MEDIUM', lastDetected: 'Aug 14, 2026' },
  { id: 'kw_06', keyword: 'need a car', category: 'TIMELINE', occurrences: 41, customers: 29, intentLevel: 'HIGH', lastDetected: 'Aug 13, 2026' },
  { id: 'kw_07', keyword: 'monthly payment', category: 'BUDGET', occurrences: 57, customers: 39, intentLevel: 'HIGH', lastDetected: 'Aug 14, 2026' },
  { id: 'kw_08', keyword: 'lease', category: 'FINANCING', occurrences: 63, customers: 44, intentLevel: 'MEDIUM', lastDetected: 'Aug 12, 2026' },
  { id: 'kw_09', keyword: 'finance', category: 'FINANCING', occurrences: 49, customers: 33, intentLevel: 'MEDIUM', lastDetected: 'Aug 13, 2026' },
  { id: 'kw_10', keyword: 'trade-in', category: 'TRADE-IN', occurrences: 38, customers: 27, intentLevel: 'HIGH', lastDetected: 'Aug 14, 2026' },
]

export const intentStats = {
  highIntent: 428,
  mediumIntent: 612,
  lowIntent: 804,
  newSignals: 96,
}

export const initialIntentSignals = CUSTOMERS.map((name, i) => {
  const phrase = PHRASES[i % PHRASES.length]
  const vehicle = ['SUV', 'Sedan', 'EV', 'Truck', 'Crossover'][i % 5]
  const budget = ['$600/month', '$700/month', '$40,000 max', 'Under $650', '$520/month'][i % 5]
  const timeline = ['This Weekend', '2 Weeks', 'This Month', '30 Days'][i % 4]
  const level = ['HIGH', 'MEDIUM', 'LOW'][i % 3]
  return {
    id: `intent_${String(i + 1).padStart(3, '0')}`,
    customerName: name,
    detectedPhrase: phrase,
    category: INTENT_CATEGORIES[i % INTENT_CATEGORIES.length],
    categories: i % 2 === 0 ? ['BUDGET', 'VEHICLE'] : [INTENT_CATEGORIES[i % INTENT_CATEGORIES.length]],
    vehicle,
    budget,
    timeline,
    intentLevel: level,
    detectedDate: `Aug ${8 + (i % 7)}, 2026`,
    location: ['Miami', 'Brickell', 'Coral Gables', 'Aventura'][i % 4],
    financing: ['Lease', 'Financing', 'Cash'][i % 3],
    leadId: i < 8 ? `LEAD-${2048 + i}` : null,
    score: level === 'HIGH' ? 82 + (i % 12) : level === 'MEDIUM' ? 55 + (i % 20) : 28 + (i % 12),
  }
})

export const initialBudgetSignals = Array.from({ length: 20 }, (_, i) => ({
  id: `bud_${String(i + 1).padStart(3, '0')}`,
  customerName: CUSTOMERS[i % CUSTOMERS.length],
  budgetSignal: [
    '$600/month',
    '$40,000 max',
    'Under $700 payment',
    'Can put $5,000 down',
    '$650/month lease',
  ][i % 5],
  paymentAmount: ['$600', '$700', '$520', '$850', '$480'][i % 5],
  financing: ['Lease', 'Financing', 'Lease', 'Financing', 'Cash'][i % 5],
  vehicle: ['2026 Lexus RX', '2026 BMW X5', '2026 Tesla Model Y', '2026 Mercedes GLE', '2026 Honda Pilot'][i % 5],
  intent: ['HIGH', 'MEDIUM', 'HIGH', 'MEDIUM', 'LOW'][i % 5],
  date: `Aug ${7 + (i % 8)}, 2026`,
  leadId: i % 5 === 0 ? `LEAD-${2050 + i}` : null,
}))
