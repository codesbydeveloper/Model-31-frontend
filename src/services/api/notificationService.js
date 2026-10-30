import { apiRequest } from './http'
import { extractItem, extractList, extractPagination, textValue, formatStamp } from './payload'

function labelFromType(type) {
  return String(type || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function mapNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id,
    category: textValue(raw.category) || labelFromType(raw.type) || 'Notification',
    title: textValue(raw.title),
    description: textValue(raw.description || raw.message || raw.body),
    severity: textValue(raw.severity || raw.level) || 'INFO',
    date: formatStamp(raw.createdAt || raw.date || raw.time) || textValue(raw.date),
    read: Boolean(raw.read || raw.isRead),
    customer: textValue(raw.customer || raw.customerName),
    vehicle: textValue(raw.vehicle),
    leadScore: raw.leadScore ?? raw.score ?? '',
    intent: textValue(raw.intent),
    dealStatus: textValue(raw.dealStatus),
    handoffId: raw.handoffId || raw.dealHandoffId || '',
  }
}

async function requestNotifications({ unread = false, limit, page } = {}) {
  const search = new URLSearchParams()
  if (unread) search.set('unread', 'true')
  if (limit) search.set('limit', String(limit))
  if (page) search.set('page', String(page))
  const query = search.toString()
  const payload = await apiRequest(`/api/notifications${query ? `?${query}` : ''}`)
  const items = extractList(payload, ['notifications', 'items']).map(mapNotification).filter(Boolean)
  const pagination = extractPagination(payload, {
    page: page || 1,
    limit: limit || items.length || 20,
    itemCount: items.length,
  })
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload
  const unreadCount = Number(data?.unreadCount)
  return {
    items,
    ...pagination,
    unreadCount: Number.isFinite(unreadCount) ? unreadCount : items.filter((item) => !item.read).length,
  }
}

export async function getNotifications(params = {}) {
  const result = await requestNotifications(params)
  return result.items
}

export async function getNotificationPage(params = {}) {
  return requestNotifications(params)
}

export async function getUnreadNotificationCount() {
  const payload = await apiRequest('/api/notifications/unread-count')
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload
  const count = Number(data?.unreadCount)
  return Number.isFinite(count) ? count : 0
}

export async function markNotificationRead(id) {
  const payload = await apiRequest(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  })
  return mapNotification(extractItem(payload, ['notification', 'item'])) || true
}

export async function markAllNotificationsRead() {
  await apiRequest('/api/notifications/read-all', { method: 'POST' })
  return true
}

export async function dismissNotification(id) {
  await apiRequest(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return true
}

const notificationService = {
  getNotifications,
  getNotificationPage,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
}

export default notificationService
