import { apiRequest } from './http'
import { extractItem, extractList, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

export function mapNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id,
    category: textValue(raw.category) || 'System Alerts',
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

export async function getNotifications() {
  const payload = await apiRequest('/api/notifications')
  return extractList(payload, ['notifications', 'items']).map(mapNotification).filter(Boolean)
}

export async function markNotificationRead(id) {
  const payload = await apiRequest(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  })
  return mapNotification(extractItem(payload, ['notification', 'item'])) || true
}

export async function markAllNotificationsRead() {
  await apiRequest('/api/notifications/read-all', { method: 'PATCH' })
  return true
}

export async function dismissNotification(id) {
  await apiRequest(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return true
}

const notificationService = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
}

export default notificationService
