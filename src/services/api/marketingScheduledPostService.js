import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'

export function mapScheduledPost(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id,
    contentId: textValue(raw.contentId) || null,
    contentTitle: textValue(raw.title || raw.contentTitle),
    platform: textValue(raw.platform),
    dealershipId: textValue(raw.dealershipId),
    dealership: textValue(raw.dealershipName || raw.dealership),
    date: textValue(raw.date),
    time: textValue(raw.time),
    timezone: textValue(raw.timezone) || 'America/New_York',
    status: textValue(raw.status) || 'SCHEDULED',
    canReschedule: Boolean(
      raw.canReschedule ?? (textValue(raw.status) || 'SCHEDULED') === 'SCHEDULED',
    ),
    canCancel: Boolean(
      raw.canCancel ?? (textValue(raw.status) || 'SCHEDULED') === 'SCHEDULED',
    ),
  }
}

export async function getScheduledPosts({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/marketing/scheduled-posts?${params.toString()}`)
  const items = extractList(payload, ['items', 'posts'])
    .map(mapScheduledPost)
    .filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getScheduledPostsCalendar() {
  const payload = await apiRequest('/api/marketing/scheduled-posts?view=calendar')
  const groups = extractList(payload, ['groups']).map((group) => ({
    date: textValue(group.date || group.label),
    items: extractList(group.items || group.posts)
      .map(mapScheduledPost)
      .filter(Boolean),
  }))
  return groups
}

export async function getScheduledPost(id) {
  const payload = await apiRequest(`/api/marketing/scheduled-posts/${id}`)
  const post = mapScheduledPost(extractItem(payload, ['post', 'item']))
  const timezones = extractList(payload.options, ['timezones'])
    .map((zone) => textValue(zone))
    .filter(Boolean)
  return {
    post,
    timezones: timezones.length
      ? timezones
      : ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'UTC'],
  }
}

export async function rescheduleScheduledPost(id, { date, time, timezone }) {
  const payload = await apiRequest(`/api/marketing/scheduled-posts/${id}/reschedule`, {
    method: 'PATCH',
    body: {
      date,
      time,
      timezone: timezone || 'America/New_York',
    },
  })
  return mapScheduledPost(extractItem(payload, ['post', 'item']))
}

export async function cancelScheduledPost(id) {
  const payload = await apiRequest(`/api/marketing/scheduled-posts/${id}/cancel`, {
    method: 'PATCH',
    body: {},
  })
  return mapScheduledPost(extractItem(payload, ['post', 'item']))
}

const marketingScheduledPostService = {
  getScheduledPosts,
  getScheduledPostsCalendar,
  getScheduledPost,
  rescheduleScheduledPost,
  cancelScheduledPost,
}

export default marketingScheduledPostService
