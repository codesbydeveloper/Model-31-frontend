function series(days, seed = 1) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date('2026-08-14')
    d.setDate(d.getDate() - (days - 1 - i))
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return {
      date: label,
      published: Math.round(2 + ((i + seed) % 5)),
      engagement: Number((4 + ((i * seed) % 7) * 0.4).toFixed(1)),
      reach: 6000 + ((i * 700 * seed) % 9000),
      leads: 8 + ((i + seed) % 12),
      impressions: 9000 + ((i * 900 * seed) % 12000),
      clicks: 220 + ((i * 40 * seed) % 300),
    }
  })
}

export const marketingAnalyticsByRange = {
  '7': {
    kpis: {
      reach: 68420,
      impressions: 112400,
      engagement: 6.9,
      clicks: 4820,
      leads: 96,
      appointments: 28,
      soldDeals: 7,
      revenue: 312000,
    },
    trend: series(7, 2),
    leadsByPlatform: [
      { name: 'Instagram', value: 32 },
      { name: 'TikTok', value: 24 },
      { name: 'Facebook', value: 18 },
      { name: 'YouTube', value: 12 },
      { name: 'X', value: 6 },
      { name: 'Whatnot', value: 4 },
    ],
    leadsByCampaign: [
      { name: 'Summer SUV', value: 34 },
      { name: 'Lease Month', value: 22 },
      { name: 'Weekend Drive', value: 18 },
      { name: 'EV Push', value: 14 },
      { name: 'Other', value: 8 },
    ],
  },
  '30': {
    kpis: {
      reach: 284520,
      impressions: 512800,
      engagement: 6.8,
      clicks: 18420,
      leads: 428,
      appointments: 112,
      soldDeals: 31,
      revenue: 1485000,
    },
    trend: series(30, 3),
    leadsByPlatform: [
      { name: 'Instagram', value: 128 },
      { name: 'TikTok', value: 97 },
      { name: 'Facebook', value: 86 },
      { name: 'YouTube', value: 52 },
      { name: 'X', value: 18 },
      { name: 'Whatnot', value: 14 },
      { name: 'WhatsApp', value: 33 },
    ],
    leadsByCampaign: [
      { name: 'Summer SUV', value: 128 },
      { name: 'Weekend Drive', value: 64 },
      { name: 'Lease Month', value: 52 },
      { name: 'EV Push', value: 91 },
      { name: 'Family Adventure', value: 38 },
      { name: 'Other', value: 55 },
    ],
  },
  '90': {
    kpis: {
      reach: 712400,
      impressions: 1280400,
      engagement: 6.4,
      clicks: 46200,
      leads: 980,
      appointments: 260,
      soldDeals: 74,
      revenue: 3620000,
    },
    trend: series(30, 5).map((row, i) => ({
      ...row,
      date: `W${i + 1}`,
      reach: row.reach * 2,
      leads: row.leads * 2,
    })),
    leadsByPlatform: [
      { name: 'Instagram', value: 280 },
      { name: 'TikTok', value: 220 },
      { name: 'Facebook', value: 190 },
      { name: 'YouTube', value: 120 },
      { name: 'X', value: 60 },
      { name: 'Whatnot', value: 40 },
      { name: 'WhatsApp', value: 70 },
    ],
    leadsByCampaign: [
      { name: 'Summer SUV', value: 260 },
      { name: 'EV Push', value: 180 },
      { name: 'Trust Builders', value: 120 },
      { name: 'Lease Month', value: 140 },
      { name: 'Weekend Drive', value: 150 },
      { name: 'Other', value: 130 },
    ],
  },
}

export const topContentPerformance = Array.from({ length: 30 }, (_, i) => ({
  id: `perf_${String(i + 1).padStart(3, '0')}`,
  content: `Top Content #${i + 1}`,
  platform: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'X'][i % 5],
  reach: 8000 + i * 2200,
  engagement: Number((3.8 + (i % 7) * 0.5).toFixed(1)),
  clicks: 180 + i * 35,
  leads: 5 + (i % 15),
  appointments: 1 + (i % 6),
}))
