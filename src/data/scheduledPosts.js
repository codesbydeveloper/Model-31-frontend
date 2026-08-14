export const SCHEDULED_STATUSES = ['SCHEDULED', 'PUBLISHED', 'CANCELLED']

export const initialScheduledPosts = Array.from({ length: 22 }, (_, i) => {
  const day = String((i % 20) + 1).padStart(2, '0')
  const statuses = ['SCHEDULED', 'SCHEDULED', 'PUBLISHED', 'CANCELLED', 'SCHEDULED']
  const platforms = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'Whatnot']
  const dealers = [
    'Miami Luxury Motors',
    'Chicago Auto Group',
    'Dallas Premium Motors',
    'Los Angeles Auto Center',
    'Houston Automotive Group',
  ]
  const status = statuses[i % statuses.length]
  return {
    id: `spost_${String(i + 1).padStart(3, '0')}`,
    contentId: `mc_${String((i % 32) + 1).padStart(3, '0')}`,
    contentTitle: `Scheduled Asset ${i + 1}`,
    platform: platforms[i % platforms.length],
    dealership: dealers[i % dealers.length],
    campaign: i % 2 === 0 ? 'Summer SUV Campaign' : 'Lease Month',
    date: `2026-08-${day}`,
    time: `${String(9 + (i % 8)).padStart(2, '0')}:00`,
    timezone: 'America/New_York',
    status,
  }
})
