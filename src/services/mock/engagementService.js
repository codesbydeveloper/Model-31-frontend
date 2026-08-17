import { delay } from '../../utils/delay'
import {
  initialEngagementRecords,
  initialStoryInteractions,
  initialReturningVisitors,
} from '../../data/acquisitionEngagement'
import { engagementOverview } from '../../data/acquisitionAnalytics'

let engagement = structuredClone(initialEngagementRecords)
let stories = structuredClone(initialStoryInteractions)
let returning = structuredClone(initialReturningVisitors)

export async function getEngagementData() {
  await delay(300)
  return {
    overview: { ...engagementOverview },
    records: structuredClone(engagement),
    stories: structuredClone(stories),
    returningVisitors: structuredClone(returning),
  }
}

export async function getEngagementByCustomer(id) {
  await delay(250)
  const item = engagement.find((e) => e.id === id)
  return item ? structuredClone(item) : null
}

const engagementService = {
  getEngagementData,
  getEngagementByCustomer,
}

export default engagementService
