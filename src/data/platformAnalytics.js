export const platformKpis = {
  totalLeads: 4280,
  qualifiedLeads: 1864,
  routedLeads: 1520,
  appointments: 612,
  soldDeals: 184,
  revenue: 8624000,
  conversionRate: 4.3,
  averageLeadScore: 74.2,
  averageResponseTime: '4m 12s',
}

export const leadFunnel = [
  { stage: 'NEW', count: 4280 },
  { stage: 'QUALIFYING', count: 3120 },
  { stage: 'QUALIFIED', count: 1864 },
  { stage: 'ROUTED', count: 1520 },
  { stage: 'APPOINTMENT', count: 612 },
  { stage: 'SOLD', count: 184 },
]

export const leadSources = [
  { source: 'Website', leads: 1240, qualified: 580, appointments: 210, sold: 68, revenue: 3120000 },
  { source: 'Facebook', leads: 860, qualified: 340, appointments: 118, sold: 32, revenue: 1480000 },
  { source: 'Instagram', leads: 720, qualified: 310, appointments: 104, sold: 28, revenue: 1290000 },
  { source: 'WhatsApp', leads: 410, qualified: 190, appointments: 72, sold: 18, revenue: 820000 },
  { source: 'TikTok', leads: 380, qualified: 160, appointments: 48, sold: 12, revenue: 540000 },
  { source: 'YouTube', leads: 260, qualified: 110, appointments: 30, sold: 9, revenue: 410000 },
  { source: 'Referral', leads: 240, qualified: 120, appointments: 22, sold: 12, revenue: 560000 },
  { source: 'Other', leads: 170, qualified: 54, appointments: 8, sold: 5, revenue: 204000 },
]

export const dealershipPerformance = [
  { dealership: 'Miami Luxury Motors', leads: 920, qualified: 410, routed: 360, appointments: 140, sold: 48, revenue: 2280000, conversionRate: 5.2 },
  { dealership: 'Chicago Auto Group', leads: 780, qualified: 340, routed: 290, appointments: 112, sold: 34, revenue: 1520000, conversionRate: 4.4 },
  { dealership: 'Dallas Premium Motors', leads: 710, qualified: 300, routed: 250, appointments: 98, sold: 30, revenue: 1380000, conversionRate: 4.2 },
  { dealership: 'Los Angeles Auto Center', leads: 860, qualified: 380, routed: 310, appointments: 126, sold: 36, revenue: 1680000, conversionRate: 4.2 },
  { dealership: 'Houston Automotive Group', leads: 620, qualified: 260, routed: 190, appointments: 82, sold: 22, revenue: 980000, conversionRate: 3.5 },
  { dealership: 'Atlanta Drive Center', leads: 390, qualified: 174, routed: 120, appointments: 54, sold: 14, revenue: 684000, conversionRate: 3.6 },
]

export const aiPerformance = {
  aiConversations: 6120,
  qualificationRate: 61.4,
  aiResponseTime: '1.8s',
  aiAssistedLeads: 2840,
  aiAppointments: 410,
  aiConversion: 5.1,
}

export const salesPerformance = {
  activeSalespeople: 42,
  averageResponseTime: '3m 40s',
  leadAcceptanceRate: 78.5,
  appointmentRate: 40.2,
  soldRate: 12.1,
}

export const salespersonPerformanceRows = [
  { id: 'sp_001', name: 'John Smith', dealership: 'Miami Luxury Motors', accepted: 48, appointments: 22, sold: 9, responseTime: '2m 10s', acceptanceRate: 92 },
  { id: 'sp_002', name: 'Michael Brown', dealership: 'Chicago Auto Group', accepted: 41, appointments: 18, sold: 7, responseTime: '3m 05s', acceptanceRate: 84 },
  { id: 'sp_003', name: 'David Wilson', dealership: 'Los Angeles Auto Center', accepted: 39, appointments: 16, sold: 6, responseTime: '4m 20s', acceptanceRate: 80 },
  { id: 'sp_004', name: 'James Anderson', dealership: 'Miami Luxury Motors', accepted: 36, appointments: 15, sold: 5, responseTime: '3m 50s', acceptanceRate: 76 },
  { id: 'sp_005', name: 'Robert Taylor', dealership: 'Dallas Premium Motors', accepted: 33, appointments: 14, sold: 5, responseTime: '5m 10s', acceptanceRate: 72 },
]

export const marketingPerformanceSummary = {
  reach: 284520,
  engagement: 6.8,
  leads: 428,
  appointments: 112,
  sold: 31,
  revenue: 1485000,
  byPlatform: [
    { name: 'Instagram', reach: 86240, leads: 128, sold: 9 },
    { name: 'TikTok', reach: 140800, leads: 97, sold: 7 },
    { name: 'Facebook', reach: 62400, leads: 86, sold: 6 },
    { name: 'YouTube', reach: 72000, leads: 52, sold: 4 },
  ],
  byCampaign: [
    { name: 'Summer SUV Campaign', leads: 128, appointments: 34, sold: 9, revenue: 428000 },
    { name: 'Lease Month', leads: 52, appointments: 18, sold: 4, revenue: 168000 },
    { name: 'EV Awareness Push', leads: 91, appointments: 28, sold: 7, revenue: 312000 },
  ],
  byDealership: [
    { name: 'Miami Luxury Motors', leads: 148, sold: 12, revenue: 540000 },
    { name: 'Chicago Auto Group', leads: 96, sold: 7, revenue: 290000 },
    { name: 'Los Angeles Auto Center', leads: 84, sold: 6, revenue: 260000 },
  ],
}

export const attributionJourney = [
  { stage: 'Marketing Interaction', count: 512800 },
  { stage: 'Lead Created', count: 428 },
  { stage: 'AI Conversation', count: 390 },
  { stage: 'Qualified', count: 186 },
  { stage: 'Salesperson Assigned', count: 152 },
  { stage: 'Appointment', count: 112 },
  { stage: 'Sold', count: 31 },
  { stage: 'Revenue', count: 1485000, isCurrency: true },
]

export const dealershipDashboardStats = {
  leadsToday: 38,
  qualifiedLeads: 16,
  assignedLeads: 12,
  appointments: 9,
  soldDeals: 3,
  revenue: 148500,
  leadTrend: [
    { date: 'Aug 8', leads: 28, qualified: 12 },
    { date: 'Aug 9', leads: 32, qualified: 14 },
    { date: 'Aug 10', leads: 25, qualified: 11 },
    { date: 'Aug 11', leads: 40, qualified: 18 },
    { date: 'Aug 12', leads: 36, qualified: 15 },
    { date: 'Aug 13', leads: 30, qualified: 13 },
    { date: 'Aug 14', leads: 38, qualified: 16 },
  ],
  leadSources: [
    { name: 'Website', value: 14 },
    { name: 'Facebook', value: 8 },
    { name: 'Instagram', value: 7 },
    { name: 'WhatsApp', value: 5 },
    { name: 'Other', value: 4 },
  ],
  salesFunnel: [
    { stage: 'Leads', count: 38 },
    { stage: 'Qualified', count: 16 },
    { stage: 'Assigned', count: 12 },
    { stage: 'Appointment', count: 9 },
    { stage: 'Sold', count: 3 },
  ],
}
