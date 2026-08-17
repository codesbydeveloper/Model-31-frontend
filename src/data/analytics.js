export const dashboardStats = {
  totalDealerships: 24,
  activeCities: 8,
  totalLeads: 4284,
  qualifiedLeads: 1726,
  routedLeads: 1412,
  appointments: 612,
  closedDeals: 384,
  sold: 384,
  conversionRate: 8.96,
  activeSalespeople: 96,
}

export const funnelStages = [
  { stage: 'NEW', count: 4284 },
  { stage: 'QUALIFYING', count: 2910 },
  { stage: 'QUALIFIED', count: 1726 },
  { stage: 'ROUTED', count: 1412 },
  { stage: 'CLOSED', count: 384 },
]

export const leadSources = [
  { source: 'Website', count: 1284, percentage: 30 },
  { source: 'Facebook', count: 856, percentage: 20 },
  { source: 'Instagram', count: 642, percentage: 15 },
  { source: 'WhatsApp', count: 514, percentage: 12 },
  { source: 'TikTok', count: 342, percentage: 8 },
  { source: 'YouTube', count: 256, percentage: 6 },
  { source: 'Referral', count: 214, percentage: 5 },
  { source: 'Other', count: 176, percentage: 4 },
]

export const leadsOverTime = {
  '7d': [
    { date: 'Mar 8', total: 142, qualified: 58, routed: 46, closed: 12 },
    { date: 'Mar 9', total: 156, qualified: 64, routed: 51, closed: 14 },
    { date: 'Mar 10', total: 138, qualified: 55, routed: 44, closed: 11 },
    { date: 'Mar 11', total: 171, qualified: 72, routed: 58, closed: 16 },
    { date: 'Mar 12', total: 164, qualified: 68, routed: 55, closed: 15 },
    { date: 'Mar 13', total: 149, qualified: 61, routed: 49, closed: 13 },
    { date: 'Mar 14', total: 178, qualified: 74, routed: 61, closed: 18 },
  ],
  '30d': [
    { date: 'Week 1', total: 980, qualified: 392, routed: 318, closed: 84 },
    { date: 'Week 2', total: 1042, qualified: 418, routed: 342, closed: 92 },
    { date: 'Week 3', total: 1118, qualified: 456, routed: 378, closed: 104 },
    { date: 'Week 4', total: 1144, qualified: 460, routed: 374, closed: 104 },
  ],
  today: [
    { date: '8 AM', total: 18, qualified: 7, routed: 5, closed: 1 },
    { date: '10 AM', total: 32, qualified: 13, routed: 10, closed: 2 },
    { date: '12 PM', total: 41, qualified: 17, routed: 14, closed: 3 },
    { date: '2 PM', total: 38, qualified: 15, routed: 12, closed: 3 },
    { date: '4 PM', total: 29, qualified: 12, routed: 9, closed: 2 },
  ],
  '90d': [
    { date: 'Jan', total: 3820, qualified: 1480, routed: 1210, closed: 320 },
    { date: 'Feb', total: 4010, qualified: 1590, routed: 1305, closed: 348 },
    { date: 'Mar', total: 4284, qualified: 1726, routed: 1412, closed: 384 },
  ],
}

export const dealershipPerformance = [
  {
    dealership: 'Miami Luxury Motors',
    city: 'Miami',
    leads: 980,
    qualified: 412,
    routed: 356,
    appointments: 198,
    sold: 94,
    closed: 94,
    conversionRate: 9.59,
    status: 'Active',
  },
  {
    dealership: 'Chicago Auto Group',
    city: 'Chicago',
    leads: 1120,
    qualified: 468,
    routed: 401,
    appointments: 224,
    sold: 108,
    closed: 108,
    conversionRate: 9.64,
    status: 'Active',
  },
  {
    dealership: 'Dallas Premium Motors',
    city: 'Dallas',
    leads: 764,
    qualified: 298,
    routed: 254,
    appointments: 142,
    sold: 62,
    closed: 62,
    conversionRate: 8.12,
    status: 'Active',
  },
  {
    dealership: 'Los Angeles Auto Center',
    city: 'Los Angeles',
    leads: 890,
    qualified: 371,
    routed: 312,
    appointments: 176,
    sold: 78,
    closed: 78,
    conversionRate: 8.76,
    status: 'Active',
  },
  {
    dealership: 'Houston Automotive Group',
    city: 'Houston',
    leads: 530,
    qualified: 177,
    routed: 89,
    appointments: 54,
    sold: 42,
    closed: 42,
    conversionRate: 7.92,
    status: 'Active',
  },
]

export const tierDistribution = [
  { tier: 'Tier A', count: 412, range: '80–100' },
  { tier: 'Tier B', count: 894, range: '40–79' },
  { tier: 'Tier C', count: 420, range: '0–39' },
]

export const analyticsSummary = {
  today: {
    totalLeads: 158,
    qualifiedLeads: 64,
    routedLeads: 50,
    closedDeals: 11,
    conversionRate: 6.96,
    averageLeadScore: 58,
    averageResponseTime: '2m 14s',
  },
  '7d': {
    totalLeads: 1098,
    qualifiedLeads: 452,
    routedLeads: 364,
    closedDeals: 99,
    conversionRate: 9.02,
    averageLeadScore: 61,
    averageResponseTime: '2m 48s',
  },
  '30d': {
    totalLeads: 4284,
    qualifiedLeads: 1726,
    routedLeads: 1412,
    closedDeals: 384,
    conversionRate: 8.96,
    averageLeadScore: 62,
    averageResponseTime: '3m 05s',
  },
  '90d': {
    totalLeads: 12114,
    qualifiedLeads: 4796,
    routedLeads: 3927,
    closedDeals: 1052,
    conversionRate: 8.68,
    averageLeadScore: 60,
    averageResponseTime: '3m 22s',
  },
}

export const conversionRateSeries = {
  today: [
    { date: '8 AM', rate: 5.5 },
    { date: '10 AM', rate: 6.2 },
    { date: '12 PM', rate: 7.3 },
    { date: '2 PM', rate: 7.9 },
    { date: '4 PM', rate: 6.9 },
  ],
  '7d': [
    { date: 'Mar 8', rate: 8.5 },
    { date: 'Mar 9', rate: 9.0 },
    { date: 'Mar 10', rate: 8.0 },
    { date: 'Mar 11', rate: 9.4 },
    { date: 'Mar 12', rate: 9.1 },
    { date: 'Mar 13', rate: 8.7 },
    { date: 'Mar 14', rate: 10.1 },
  ],
  '30d': [
    { date: 'Week 1', rate: 8.6 },
    { date: 'Week 2', rate: 8.8 },
    { date: 'Week 3', rate: 9.3 },
    { date: 'Week 4', rate: 9.1 },
  ],
  '90d': [
    { date: 'Jan', rate: 8.4 },
    { date: 'Feb', rate: 8.7 },
    { date: 'Mar', rate: 9.0 },
  ],
}
