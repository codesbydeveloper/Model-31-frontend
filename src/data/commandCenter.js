export const commandKpis = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    hint: 'All pipelines this month',
    trend: { direction: 'up', value: '+8.2%' },
  },
  {
    key: 'qualifiedLeads',
    label: 'Qualified Leads',
    hint: 'Passed qualification',
    trend: { direction: 'up', value: '+5.1%' },
  },
  {
    key: 'routedLeads',
    label: 'Routed Leads',
    hint: 'Assigned to sales',
    trend: { direction: 'up', value: '+3.4%' },
  },
  {
    key: 'appointments',
    label: 'Appointments',
    hint: 'Scheduled this month',
    trend: { direction: 'up', value: '+6.8%' },
  },
  {
    key: 'sold',
    label: 'Sold',
    hint: 'Closed deals',
    trend: { direction: 'up', value: '+4.2%' },
  },
  {
    key: 'conversionRate',
    label: 'Conversion Rate',
    hint: 'Lead to sold',
    trend: { direction: 'up', value: '+0.4 pts' },
  },
]

export const dispatchMap = {
  rooftops: [
    { id: 'dlr_001', name: 'Miami Luxury Motors', city: 'Miami', x: 78, y: 74 },
    { id: 'dlr_002', name: 'Chicago Auto Group', city: 'Chicago', x: 58, y: 28 },
    { id: 'dlr_003', name: 'Dallas Premium Motors', city: 'Dallas', x: 48, y: 62 },
    { id: 'dlr_004', name: 'Los Angeles Auto Center', city: 'Los Angeles', x: 12, y: 48 },
    { id: 'dlr_005', name: 'Houston Automotive Group', city: 'Houston', x: 52, y: 78 },
  ],
  salespeople: [
    { id: 'sp_001', name: 'John Smith', rooftopId: 'dlr_001', status: 'ONLINE', x: 82, y: 68 },
    { id: 'sp_004', name: 'James Anderson', rooftopId: 'dlr_001', status: 'ONLINE', x: 74, y: 66 },
    { id: 'sp_002', name: 'Michael Brown', rooftopId: 'dlr_002', status: 'ONLINE', x: 62, y: 22 },
    { id: 'sp_005', name: 'Robert Taylor', rooftopId: 'dlr_003', status: 'BUSY', x: 52, y: 56 },
    { id: 'sp_003', name: 'David Wilson', rooftopId: 'dlr_004', status: 'OFFLINE', x: 16, y: 42 },
  ],
  activeLeads: [
    { id: 'LEAD-2048', name: 'Sarah Johnson', rooftopId: 'dlr_001', salespersonId: 'sp_001', x: 70, y: 80 },
    { id: 'LEAD-2050', name: 'Elena Vargas', rooftopId: 'dlr_003', salespersonId: 'sp_005', x: 42, y: 70 },
    { id: 'LEAD-2049', name: 'Marcus Lee', rooftopId: 'dlr_002', salespersonId: 'sp_002', x: 54, y: 36 },
    { id: 'LEAD-2056', name: 'Sofia Ramirez', rooftopId: 'dlr_004', salespersonId: 'sp_003', x: 8, y: 56 },
  ],
}

export const socialEngineRows = [
  { id: 'soc_ig', platform: 'Instagram', content: 'SUV Lease Reel #42', engagement: '7.4%', leads: 128, qualified: 54, sold: 9 },
  { id: 'soc_fb', platform: 'Facebook', content: 'Summer Offer Post #18', engagement: '5.9%', leads: 86, qualified: 31, sold: 6 },
  { id: 'soc_tt', platform: 'TikTok', content: 'EV Walkaround #11', engagement: '9.2%', leads: 97, qualified: 41, sold: 7 },
  { id: 'soc_yt', platform: 'YouTube', content: 'Inventory Tour #04', engagement: '4.6%', leads: 52, qualified: 22, sold: 4 },
]

export const crmReadOnlySync = {
  status: 'Connected',
  mode: 'READ ONLY',
  lastSync: '2 minutes ago',
  recordsRead: 1284,
  newUpdates: 18,
  errors: 0,
}

export const underwaterRescue = {
  kpis: {
    rescuedLeads: 186,
    rescuedAppointments: 64,
    rescuedSales: 21,
    averageGross: 4850,
    revenueMonth: 101850,
    revenueYear: 742200,
  },
  activity: [
    { id: 'res_001', signalSource: 'Call', rescueMethod: 'Callback', status: 'Sale', timestamp: 'Aug 17, 10:14 AM', sale: 'Yes', recoveredAmount: 6200, leadId: 'LEAD-2048' },
    { id: 'res_002', signalSource: 'Chat', rescueMethod: 'SMS', status: 'Appointment', timestamp: 'Aug 17, 9:41 AM', sale: 'No', recoveredAmount: 0, leadId: 'LEAD-2054' },
    { id: 'res_003', signalSource: 'DM', rescueMethod: 'SMS', status: 'Contacted', timestamp: 'Aug 16, 4:22 PM', sale: 'No', recoveredAmount: 0, leadId: 'LEAD-2050' },
    { id: 'res_004', signalSource: 'Email', rescueMethod: 'Email', status: 'Sent', timestamp: 'Aug 16, 11:05 AM', sale: 'No', recoveredAmount: 0, leadId: 'LEAD-2058' },
    { id: 'res_005', signalSource: 'CRM', rescueMethod: 'Callback', status: 'Sale', timestamp: 'Aug 15, 2:18 PM', sale: 'Yes', recoveredAmount: 5400, leadId: 'LEAD-2064' },
    { id: 'res_006', signalSource: 'Call', rescueMethod: 'Email', status: 'Appointment', timestamp: 'Aug 15, 10:02 AM', sale: 'No', recoveredAmount: 0, leadId: 'LEAD-2067' },
  ],
  rescueChart: [
    { name: 'Week 1', rescued: 38, appointments: 12, sales: 4 },
    { name: 'Week 2', rescued: 44, appointments: 16, sales: 5 },
    { name: 'Week 3', rescued: 51, appointments: 18, sales: 6 },
    { name: 'Week 4', rescued: 53, appointments: 18, sales: 6 },
  ],
  revenueChart: [
    { name: 'Week 1', revenue: 21400 },
    { name: 'Week 2', revenue: 24800 },
    { name: 'Week 3', revenue: 27650 },
    { name: 'Week 4', revenue: 28000 },
  ],
  signalBreakdown: [
    { source: 'Call', count: 62 },
    { source: 'Chat', count: 41 },
    { source: 'DM', count: 38 },
    { source: 'Email', count: 27 },
    { source: 'CRM', count: 18 },
  ],
}

export const inboxMessages = {
  'LEAD-2048': 'This weekend works if you have the RX available.',
  'LEAD-2054': 'Can someone call me about the Pilot lease?',
  'LEAD-2055': 'Still deciding between F-150 trims.',
  'LEAD-2058': 'Is the X5 still in stock in Coral Gables?',
  'LEAD-2060': 'Need Spanish-speaking salesperson please.',
  'LEAD-2064': 'I went cold last week — still interested.',
}
