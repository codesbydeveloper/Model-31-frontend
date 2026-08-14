import { delay } from '../../utils/delay'
import { initialScheduledPosts } from '../../data/scheduledPosts'
import { markScheduled } from './marketingContentService'

let posts = structuredClone(initialScheduledPosts)

export async function getScheduledPosts() {
  await delay(300)
  return structuredClone(posts)
}

export async function schedulePost(payload) {
  await delay(650)
  const item = {
    id: `spost_${Date.now()}`,
    contentId: payload.contentId || '',
    contentTitle: payload.contentTitle || 'Scheduled Content',
    platform: payload.platform,
    dealership: payload.dealership,
    campaign: payload.campaign || '',
    date: payload.date,
    time: payload.time,
    timezone: payload.timezone || 'America/New_York',
    status: 'SCHEDULED',
  }
  posts = [item, ...posts]
  if (payload.contentId) {
    await markScheduled(payload.contentId, payload.date)
  }
  return structuredClone(item)
}

export async function reschedulePost(id, { date, time, timezone }) {
  await delay(500)
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Scheduled post not found')
  posts[index] = {
    ...posts[index],
    date,
    time,
    timezone: timezone || posts[index].timezone,
    status: 'SCHEDULED',
  }
  return structuredClone(posts[index])
}

export async function cancelScheduledPost(id) {
  await delay(450)
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Scheduled post not found')
  posts[index] = { ...posts[index], status: 'CANCELLED' }
  return structuredClone(posts[index])
}

const scheduledPostService = {
  getScheduledPosts,
  schedulePost,
  reschedulePost,
  cancelScheduledPost,
}

export default scheduledPostService
