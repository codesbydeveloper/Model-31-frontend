import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function formatChartDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function mapChartRows(rows, fields) {
  return extractList(rows).map((row, index) => {
    const mapped = {
      name: textValue(
        row.name || row.week || row.day || row.persona || row.date,
        `Item ${index + 1}`,
      ),
    }
    for (const field of fields) {
      mapped[field] = numberValue(row[field])
    }
    return mapped
  })
}

export async function getMarketingDashboard(rangeDays = 30) {
  const payload = await apiRequest(
    `/api/marketing/dashboard?rangeDays=${Number(rangeDays) || 30}`,
  )
  const raw = extractItem(payload, ['dashboard']) || payload
  const stats = raw.stats || payload.stats || {}

  return {
    stats: {
      totalContent: numberValue(stats.totalContent),
      pendingApproval: numberValue(stats.pendingApproval),
      scheduledPosts: numberValue(stats.scheduledPosts),
      publishedPosts: numberValue(stats.publishedPosts),
      activeCampaigns: numberValue(stats.activeCampaigns),
      totalReach: numberValue(stats.totalReach),
      engagementRate: numberValue(stats.engagementRate),
      leadsGenerated: numberValue(stats.leadsGenerated),
    },
    trend: extractList(
      raw.contentPerformance || raw.trend,
      ['contentPerformance'],
    ).map((row) => ({
      date: formatChartDate(row.date) || textValue(row.date),
      published: numberValue(row.contentPublished, row.published),
      engagement: numberValue(row.engagement),
      reach: numberValue(row.reach),
      leads: numberValue(row.leads),
    })),
    platforms: extractList(
      raw.platformPerformance || raw.platforms,
      ['platformPerformance'],
    ).map((row) => ({
      platform: textValue(row.platform),
      connected:
        row.connected === true ||
        String(row.status || '').toUpperCase() === 'CONNECTED',
      posts: numberValue(row.posts),
      reach: numberValue(row.reach),
      engagement: numberValue(row.engagement),
      leads: numberValue(row.leads),
    })),
    notifications: extractList(raw.notifications, ['notifications']).map(
      (row, index) => ({
        id: row.id || `note_${index}`,
        title: textValue(row.title || row.type),
        message: textValue(row.message),
        time: formatStamp(row.createdAt || row.time) || textValue(row.time),
      }),
    ),
  }
}

export async function getAcquisitionDashboard() {
  const payload = await apiRequest('/api/marketing/acquisition/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload
  const stats = raw.stats || {}
  const model31 = raw.model31Leads || {}
  const dealership = raw.dealershipLeads || {}
  const charts = raw.charts || {}

  return {
    kpis: {
      engagedPeople: numberValue(stats.engagedPeople),
      highIntent: numberValue(stats.highIntent),
      budgetSignals: numberValue(stats.budgetSignals),
      returningVisitors: numberValue(stats.returningVisitors),
      referrals: numberValue(stats.referrals),
      lifeEvents: numberValue(stats.lifeEvents),
      activePersonas: numberValue(stats.activePersonas),
      activeFollowUps: numberValue(stats.activeFollowUps),
      model31Leads: numberValue(model31.generated, stats.model31Leads),
      model31Qualified: numberValue(model31.qualified, stats.model31Qualified),
      model31Appointments: numberValue(
        model31.appointments,
        stats.model31Appointments,
      ),
      model31Sold: numberValue(model31.sold, stats.model31Sold),
      dealershipLeads: numberValue(dealership.total, stats.dealershipLeads),
    },
    dealershipNote: textValue(dealership.note),
    funnel: extractList(raw.funnel, ['funnel']).map((row) => ({
      stage: textValue(row.stage),
      count: numberValue(row.count, row.value),
    })),
    engagementOverview: {
      likes: numberValue(raw.engagementOverview?.likes),
      comments: numberValue(raw.engagementOverview?.comments),
      shares: numberValue(raw.engagementOverview?.shares),
      saves: numberValue(raw.engagementOverview?.saves),
      dmInteractions: numberValue(raw.engagementOverview?.dmInteractions),
      storyReplies: numberValue(raw.engagementOverview?.storyReplies),
      storyReactions: numberValue(raw.engagementOverview?.storyReactions),
      returnVisits: numberValue(raw.engagementOverview?.returnVisits),
    },
    charts: {
      engagementToLeads: mapChartRows(
        charts.engagementVsLeads || charts.engagementToLeads,
        ['engagement', 'leads'],
      ),
      intentToLeads: mapChartRows(
        charts.intentVsLeads || charts.intentToLeads,
        ['intent', 'leads'],
      ),
      referralsToLeads: mapChartRows(
        charts.referralsLeads || charts.referralsToLeads,
        ['referrals', 'leads'],
      ),
      lifeEventsToLeads: mapChartRows(
        charts.lifeEventsLeads || charts.lifeEventsToLeads,
        ['events', 'leads'],
      ),
      personaToLeads: mapChartRows(
        charts.personaLeads || charts.personaToLeads,
        ['leads'],
      ),
      communityToLeads: mapChartRows(
        charts.communityLeads || charts.communityToLeads,
        ['communities', 'leads'],
      ),
      followUpConversion: mapChartRows(charts.followUpConversion, [
        'started',
        'converted',
      ]),
    },
  }
}

const marketingDashboardService = {
  getMarketingDashboard,
  getAcquisitionDashboard,
}

export default marketingDashboardService
