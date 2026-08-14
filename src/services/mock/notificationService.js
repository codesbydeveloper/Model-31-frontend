import { delay } from '../../utils/delay'
import { initialPlatformNotifications } from '../../data/platformNotifications'

let notifications = structuredClone(initialPlatformNotifications)

export async function getNotifications() {
  await delay(250)
  return structuredClone(notifications)
}

export async function markNotificationRead(id) {
  await delay(300)
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  )
  return structuredClone(notifications.find((n) => n.id === id))
}

export async function markAllNotificationsRead() {
  await delay(400)
  notifications = notifications.map((n) => ({ ...n, read: true }))
  return structuredClone(notifications)
}

const notificationService = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
}

export default notificationService
