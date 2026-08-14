import { delay } from '../../utils/delay'
import {
  marketingAnalyticsByRange,
  topContentPerformance,
} from '../../data/marketingAnalytics'

export async function getMarketingAnalytics(range = '30') {
  await delay(300)
  const key = String(range)
  const data = marketingAnalyticsByRange[key] || marketingAnalyticsByRange['30']
  return structuredClone(data)
}

export async function getTopContent(sortBy = 'reach') {
  await delay(250)
  const rows = structuredClone(topContentPerformance)
  rows.sort((a, b) => Number(b[sortBy] || 0) - Number(a[sortBy] || 0))
  return rows
}

const marketingAnalyticsService = {
  getMarketingAnalytics,
  getTopContent,
}

export default marketingAnalyticsService
