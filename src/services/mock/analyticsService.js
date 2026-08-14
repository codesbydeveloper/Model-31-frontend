import { delay } from '../../utils/delay'
import {
  analyticsSummary,
  conversionRateSeries,
  dashboardStats,
  dealershipPerformance,
  funnelStages,
  leadSources,
  leadsOverTime,
  tierDistribution,
} from '../../data/analytics'
import { recentActivity, initialSystemStatus } from '../../data/notifications'

let systemStatus = { ...initialSystemStatus }

export async function getDashboardOverview() {
  await delay(400)
  return {
    stats: { ...dashboardStats },
    funnel: [...funnelStages],
    sources: [...leadSources],
    performance: [...dealershipPerformance],
    activity: [...recentActivity],
    systemStatus: { ...systemStatus },
    chart: [...leadsOverTime['30d']],
  }
}

export async function updateSystemToggle(key, value) {
  await delay(450)
  systemStatus = { ...systemStatus, [key]: value }
  return { ...systemStatus }
}

export async function getAnalytics(range = '30d') {
  await delay(400)
  const key = range
  return {
    summary: { ...analyticsSummary[key] },
    leadsOverTime: [...(leadsOverTime[key] || leadsOverTime['30d'])],
    sources: [...leadSources],
    performance: [...dealershipPerformance],
    tiers: [...tierDistribution],
    conversionRate: [...(conversionRateSeries[key] || conversionRateSeries['30d'])],
  }
}

const analyticsService = {
  getDashboardOverview,
  updateSystemToggle,
  getAnalytics,
}

export default analyticsService
