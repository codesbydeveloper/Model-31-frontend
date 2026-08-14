export const CONTENT_TYPES = [
  'Social Post',
  'Vehicle Promotion',
  'Dealership Promotion',
  'Offer',
  'Educational',
  'Customer Story',
  'Video Script',
  'Image Prompt',
  'Campaign Copy',
]

export const CONTENT_STATUSES = [
  'DRAFT',
  'PENDING APPROVAL',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'REJECTED',
]

export const SOCIAL_PLATFORMS = [
  'Facebook',
  'Instagram',
  'TikTok',
  'YouTube',
  'X',
  'Whatnot',
  'WhatsApp',
]

export const TONES = [
  'Professional',
  'Friendly',
  'Luxury',
  'Casual',
  'Urgent',
  'Promotional',
]

export const LANGUAGES = ['English', 'Spanish']

export const AUDIENCES = [
  'Luxury Buyer',
  'Family Buyer',
  'First-Time Buyer',
  'Lease Buyer',
  'EV Buyer',
  'Budget Buyer',
]

export const DEALERSHIPS = [
  'Miami Luxury Motors',
  'Chicago Auto Group',
  'Dallas Premium Motors',
  'Los Angeles Auto Center',
  'Houston Automotive Group',
  'Atlanta Drive Center',
]

export const MOCK_GENERATIONS = [
  {
    title: '2026 Lexus RX — Luxury Without Compromise',
    content:
      'Experience the perfect combination of luxury, comfort and technology with the 2026 Lexus RX. Visit our dealership today to explore available options.',
    hashtags: ['#LexusRX', '#LuxurySUV', '#AutoFlow'],
  },
  {
    title: 'Drive Home in a 2026 BMW X5 This Weekend',
    content:
      'Limited weekend inventory on the 2026 BMW X5. Schedule a test drive and discover why families and executives choose this premium SUV.',
    hashtags: ['#BMWX5', '#TestDrive', '#PremiumSUV'],
  },
  {
    title: 'EV Ready: 2026 Tesla Model Y Specials',
    content:
      'Go further for less with current Model Y offers. Clean tech, strong range, and dealership-backed support every mile of the way.',
    hashtags: ['#TeslaModelY', '#EVLife', '#GreenDrive'],
  },
  {
    title: 'Family Adventures Start in the Escalade',
    content:
      'Room for everyone and every weekend plan. Explore the 2026 Cadillac Escalade with flexible financing options tailored for families.',
    hashtags: ['#Escalade', '#FamilySUV', '#DealershipOffers'],
  },
  {
    title: 'Lease Luxury for Less — Limited Time',
    content:
      'Lock in promotional lease rates on select luxury vehicles. Speak with our team today before this month’s allocations are gone.',
    hashtags: ['#LeaseDeals', '#LuxuryLease', '#AutoFlowMarketing'],
  },
]

export const MOCK_VIDEO_SCRIPTS = {
  '15': [
    { scene: 1, text: 'Open on gleaming SUV exterior under sunset lighting.' },
    { scene: 2, text: 'Quick interior shots: seats, screen, panoramic roof.' },
    { scene: 3, text: 'Customer smile + handshake with salesperson.' },
    { scene: 4, text: 'Logo + “Book your test drive today.” CTA.' },
  ],
  '30': [
    { scene: 1, text: 'Aerial approach to modern dealership entrance.' },
    { scene: 2, text: 'Hero vehicle rotating on showroom floor.' },
    { scene: 3, text: 'Family loading cargo, kids buckling in.' },
    { scene: 4, text: 'Offer overlay + website/QR CTA.' },
  ],
  '60': [
    { scene: 1, text: 'Lifestyle montage: city commute to weekend getaway.' },
    { scene: 2, text: 'Feature callouts: safety, tech, efficiency.' },
    { scene: 3, text: 'Customer testimonial soundbite.' },
    { scene: 4, text: 'Dealership walkthrough + schedule appointment CTA.' },
  ],
}

function activity(description, actor, time) {
  return {
    id: `mact_${Math.random().toString(36).slice(2, 9)}`,
    description,
    actor,
    time,
  }
}

const baseItems = [
  ['Lexus RX Luxury Launch', 'Vehicle Promotion', 'Instagram', 'Miami Luxury Motors', 'Summer SUV Campaign', 'PUBLISHED', 'Taylor Quinn', '2026-07-12', '2026-07-15'],
  ['BMW X5 Weekend Drive', 'Social Post', 'Facebook', 'Chicago Auto Group', 'Weekend Test Drive', 'SCHEDULED', 'Taylor Quinn', '2026-08-01', '2026-08-16'],
  ['Tesla Model Y EV Story', 'Educational', 'TikTok', 'Los Angeles Auto Center', 'EV Awareness Push', 'PENDING APPROVAL', 'Alex Rivera', '2026-08-10', null],
  ['Escalade Family Offer', 'Offer', 'YouTube', 'Dallas Premium Motors', 'Family Adventure', 'APPROVED', 'Taylor Quinn', '2026-08-05', null],
  ['Dealership Open House', 'Dealership Promotion', 'X', 'Houston Automotive Group', 'Open House August', 'DRAFT', 'Jordan Lee', '2026-08-12', null],
  ['Customer Story: Maria', 'Customer Story', 'Instagram', 'Miami Luxury Motors', 'Trust Builders', 'PUBLISHED', 'Taylor Quinn', '2026-06-20', '2026-06-22'],
  ['Image: Sunset SUV', 'Image Prompt', 'Instagram', 'Atlanta Drive Center', 'Brand Visuals', 'PENDING APPROVAL', 'Alex Rivera', '2026-08-11', null],
  ['Video: 30s RX Spot', 'Video Script', 'TikTok', 'Miami Luxury Motors', 'Summer SUV Campaign', 'APPROVED', 'Taylor Quinn', '2026-08-08', null],
  ['Lease Promo Copy', 'Campaign Copy', 'Facebook', 'Chicago Auto Group', 'Lease Month', 'REJECTED', 'Jordan Lee', '2026-08-03', null],
  ['Whatnot Live Auction Teaser', 'Social Post', 'Whatnot', 'Dallas Premium Motors', 'Live Inventory', 'SCHEDULED', 'Taylor Quinn', '2026-08-09', '2026-08-18'],
]

function expandContent() {
  const items = []
  const platforms = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'Whatnot']
  const types = CONTENT_TYPES
  const statuses = CONTENT_STATUSES
  const dealers = DEALERSHIPS
  const campaigns = [
    'Summer SUV Campaign',
    'Weekend Test Drive',
    'EV Awareness Push',
    'Family Adventure',
    'Open House August',
    'Trust Builders',
    'Brand Visuals',
    'Lease Month',
    'Live Inventory',
    'Fall Luxury Push',
  ]

  baseItems.forEach((row, i) => {
    const [title, type, platform, dealership, campaign, status, createdBy, createdDate, scheduledDate] =
      row
    items.push({
      id: `mc_${String(i + 1).padStart(3, '0')}`,
      title,
      contentType: type,
      platform,
      dealership,
      campaign,
      status,
      createdBy,
      createdDate,
      scheduledDate,
      vehicle: '2026 Lexus RX',
      offer: status === 'REJECTED' ? 'Update offer details required' : 'Limited weekend special',
      tone: 'Luxury',
      language: 'English',
      audience: 'Luxury Buyer',
      brief: 'Highlight luxury SUV inventory and book a test drive.',
      body:
        'Experience the perfect combination of luxury, comfort and technology. Visit our dealership today to explore available options.',
      hashtags: ['#LexusRX', '#LuxurySUV', '#AutoFlow'],
      imagePrompt:
        type === 'Image Prompt'
          ? 'Luxury black SUV parked outside a modern dealership at sunset.'
          : '',
      imageUrl: type === 'Image Prompt' || status === 'PUBLISHED' ? 'mock' : '',
      videoDuration: type === 'Video Script' ? '30' : '',
      scenes: type === 'Video Script' ? structuredClone(MOCK_VIDEO_SCRIPTS['30']) : [],
      rejectionReason: status === 'REJECTED' ? 'Please update the offer details.' : '',
      changeRequests: [],
      performance: {
        reach: 12000 + i * 2400,
        engagement: Number((4.2 + (i % 5) * 0.7).toFixed(1)),
        clicks: 320 + i * 45,
        leads: 8 + (i % 12),
        appointments: 2 + (i % 5),
      },
      activity: [
        activity('Content created', createdBy, `${createdDate} 09:00`),
        activity('AI content generated', 'AI System', `${createdDate} 09:01`),
        ...(status !== 'DRAFT'
          ? [activity('Submitted for approval', createdBy, `${createdDate} 10:15`)]
          : []),
        ...(status === 'APPROVED' || status === 'SCHEDULED' || status === 'PUBLISHED'
          ? [activity('Approved', 'Taylor Quinn', `${createdDate} 14:00`)]
          : []),
        ...(status === 'REJECTED'
          ? [activity('Rejected', 'Taylor Quinn', `${createdDate} 13:40`)]
          : []),
        ...(status === 'SCHEDULED'
          ? [activity('Scheduled', createdBy, `${scheduledDate || createdDate} 08:00`)]
          : []),
        ...(status === 'PUBLISHED'
          ? [activity('Published', 'System', `${scheduledDate || createdDate} 12:00`)]
          : []),
      ],
    })
  })

  for (let i = baseItems.length; i < 32; i += 1) {
    const status = statuses[i % statuses.length]
    const type = types[i % types.length]
    const platform = platforms[i % platforms.length]
    const createdDate = `2026-0${(i % 7) + 1}-${String((i % 27) + 1).padStart(2, '0')}`
    items.push({
      id: `mc_${String(i + 1).padStart(3, '0')}`,
      title: `${type} — ${platform} Asset ${i + 1}`,
      contentType: type,
      platform,
      dealership: dealers[i % dealers.length],
      campaign: campaigns[i % campaigns.length],
      status,
      createdBy: i % 2 === 0 ? 'Taylor Quinn' : 'Alex Rivera',
      createdDate,
      scheduledDate: status === 'SCHEDULED' || status === 'PUBLISHED' ? '2026-08-20' : null,
      vehicle: i % 2 === 0 ? '2026 BMW X5' : '2026 Tesla Model Y',
      offer: 'Seasonal financing available',
      tone: TONES[i % TONES.length],
      language: i % 5 === 0 ? 'Spanish' : 'English',
      audience: AUDIENCES[i % AUDIENCES.length],
      brief: 'Generate engaging dealership content for social channels.',
      body: MOCK_GENERATIONS[i % MOCK_GENERATIONS.length].content,
      hashtags: MOCK_GENERATIONS[i % MOCK_GENERATIONS.length].hashtags,
      imagePrompt:
        type === 'Image Prompt'
          ? 'Luxury black SUV parked outside a modern dealership at sunset.'
          : '',
      imageUrl: type === 'Image Prompt' ? 'mock' : '',
      videoDuration: type === 'Video Script' ? ['15', '30', '60'][i % 3] : '',
      scenes:
        type === 'Video Script'
          ? structuredClone(MOCK_VIDEO_SCRIPTS[['15', '30', '60'][i % 3]])
          : [],
      rejectionReason: status === 'REJECTED' ? 'Tone feels too aggressive.' : '',
      changeRequests: [],
      performance: {
        reach: 5000 + i * 1800,
        engagement: Number((3.5 + (i % 6) * 0.6).toFixed(1)),
        clicks: 150 + i * 30,
        leads: 4 + (i % 10),
        appointments: 1 + (i % 4),
      },
      activity: [
        activity('Content created', 'Taylor Quinn', `${createdDate} 11:00`),
        activity('AI content generated', 'AI System', `${createdDate} 11:02`),
      ],
    })
  }

  return items
}

export const initialMarketingContent = expandContent()

export const marketingDashboardStats = {
  totalContent: 184,
  pendingApproval: 12,
  scheduledPosts: 28,
  publishedPosts: 144,
  activeCampaigns: 8,
  totalReach: 284520,
  engagementRate: 6.8,
  leadsGenerated: 428,
}
