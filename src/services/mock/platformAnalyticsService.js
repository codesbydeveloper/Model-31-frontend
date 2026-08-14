import { delay } from '../../utils/delay'
import {
  platformKpis,
  leadFunnel,
  leadSources,
  dealershipPerformance,
  aiPerformance,
  salesPerformance,
  salespersonPerformanceRows,
  marketingPerformanceSummary,
  attributionJourney,
  dealershipDashboardStats,
} from '../../data/platformAnalytics'

export async function getPlatformAnalytics() {
  await delay(320)
  return {
    kpis: { ...platformKpis },
    funnel: structuredClone(leadFunnel),
    sources: structuredClone(leadSources),
    dealerships: structuredClone(dealershipPerformance),
    ai: { ...aiPerformance },
    sales: { ...salesPerformance },
    salespeople: structuredClone(salespersonPerformanceRows),
    marketing: structuredClone(marketingPerformanceSummary),
    journey: structuredClone(attributionJourney),
  }
}

export async function getDealershipDashboard() {
  await delay(280)
  return structuredClone(dealershipDashboardStats)
}

const platformAnalyticsService = {
  getPlatformAnalytics,
  getDealershipDashboard,
}

export default platformAnalyticsService
