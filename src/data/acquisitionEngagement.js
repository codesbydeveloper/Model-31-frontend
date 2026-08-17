const NAMES = [
  'Sarah Johnson',
  'Robert Hayes',
  'Chloe Bennett',
  'Brian Foster',
  'Priya Patel',
  'Marcus Lee',
  'Elena Vargas',
  'Aisha Khan',
  'James Anderson',
  'Emily Chen',
  'Natalie Gomez',
  'Hannah Kim',
  'Tony Ricci',
  'David Chen',
  'Sofia Morales',
  'Lucas Rivera',
  'Olivia Brooks',
  'Noah Patel',
  'Mia Torres',
  'Ethan Brooks',
  'Ava Martinez',
  'Liam Nguyen',
  'Isabella Cruz',
  'Mason Reed',
  'Harper Diaz',
  'Logan Scott',
  'Amelia Price',
  'Jackson Cole',
  'Charlotte Ruiz',
  'Benjamin Shaw',
  'Grace Kim',
  'Henry Walsh',
]

const PERSONAS = [
  'Luxury Lifestyle',
  'Family Focus',
  'First-Time Buyer',
  'EV Enthusiast',
  'Performance Buyer',
  'Budget Smart',
  'Lease Shopper',
  'Adventure Driver',
]

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'X']
const LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH']

function levelFromScore(score) {
  if (score >= 85) return 'VERY HIGH'
  if (score >= 65) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export const ENGAGEMENT_LEVELS = LEVELS

export const initialEngagementRecords = NAMES.map((name, i) => {
  const likes = 1 + ((i * 3) % 12)
  const comments = (i * 2) % 8
  const shares = i % 5
  const saves = (i * 2) % 9
  const dm = 1 + (i % 10)
  const story = i % 6
  const returns = 1 + (i % 7)
  const score = likes * 4 + comments * 6 + shares * 5 + saves * 5 + dm * 8 + story * 4 + returns * 7
  return {
    id: `eng_${String(i + 1).padStart(3, '0')}`,
    customerName: name,
    persona: PERSONAS[i % PERSONAS.length],
    platform: PLATFORMS[i % PLATFORMS.length],
    likes,
    comments,
    shares,
    saves,
    dmInteractions: dm,
    storyInteractions: story,
    returnVisits: returns,
    engagementLevel: levelFromScore(score),
    lastActivity: `Aug ${10 + (i % 5)}, 2026`,
    firstInteraction: `Aug ${1 + (i % 9)}, 2026`,
    lastInteraction: `Aug ${10 + (i % 5)}, 2026`,
    totalInteractions: likes + comments + shares + saves + dm + story,
    dealership: 'Miami Luxury Motors',
    leadId: i % 4 === 0 ? `LEAD-${2048 + (i % 20)}` : null,
    dmBehavior: {
      opens: 2 + (i % 8),
      replies: 1 + (i % 5),
      repeatOpens: i % 4,
      conversationReturns: i % 3,
      responseTime: `${1 + (i % 12)}m`,
      engagementLevel: levelFromScore(score),
    },
    timeline: [
      { id: `t${i}_1`, type: 'Liked Post', detail: 'Lexus RX launch reel', time: 'Aug 10, 9:12 AM' },
      { id: `t${i}_2`, type: 'Commented', detail: '"Looking at lease options"', time: 'Aug 11, 2:40 PM' },
      { id: `t${i}_3`, type: 'Saved Post', detail: 'SUV inventory carousel', time: 'Aug 12, 11:05 AM' },
      { id: `t${i}_4`, type: 'Replied to Story', detail: 'Weekend test drive story', time: 'Aug 13, 6:22 PM' },
      { id: `t${i}_5`, type: 'Opened DM', detail: 'Persona welcome message', time: 'Aug 14, 10:01 AM' },
      { id: `t${i}_6`, type: 'Returned to Persona', detail: 'Viewed Luxury Lifestyle profile', time: 'Aug 14, 4:18 PM' },
    ].slice(0, 3 + (i % 4)),
  }
})

export const initialStoryInteractions = Array.from({ length: 24 }, (_, i) => ({
  id: `story_${String(i + 1).padStart(3, '0')}`,
  customerName: NAMES[i % NAMES.length],
  story: ['Weekend Inventory', 'Lease Special', 'EV Test Drive', 'Family SUV Spotlight'][i % 4],
  platform: PLATFORMS[i % PLATFORMS.length],
  interaction: ['VIEW', 'REPLY', 'REACTION', 'LINK INTERACTION'][i % 4],
  date: `Aug ${8 + (i % 7)}, 2026`,
  intent: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
  status: ['NEW', 'REVIEWED', 'FOLLOWED UP'][i % 3],
}))

export const initialReturningVisitors = NAMES.slice(0, 18).map((name, i) => ({
  id: `ret_${String(i + 1).padStart(3, '0')}`,
  customerName: name,
  firstVisit: `Aug ${5 + (i % 5)}, 2026`,
  latestVisit: `Aug ${12 + (i % 3)}, 2026`,
  visitCount: 2 + (i % 6),
  lastInteraction: ['DM reopened', 'Story reply', 'Post save', 'Profile visit'][i % 4],
  engagementLevel: LEVELS[1 + (i % 3)],
  potentialIntent: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
}))
