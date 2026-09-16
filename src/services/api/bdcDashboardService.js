import { apiRequest } from './http'
import { extractItem, extractList, textValue } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function mapPerson(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.salespersonId,
    name: textValue(raw.name || raw.fullName),
    dealership: textValue(raw.dealership),
    status: textValue(raw.status || raw.presence) || 'OFFLINE',
    currentLeads: numberValue(raw.currentLeads, raw.assigned, raw.activeLeads),
    lastActive: textValue(raw.lastActive, raw.lastSeen) || '—',
    capacity: numberValue(raw.capacity, raw.maxLeads) || 0,
  }
}

export async function getBdcDashboard() {
  const payload = await apiRequest('/api/bdc/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload?.data || payload
  const stats = raw.stats || raw.summary || raw
  const appointments = raw.appointments || raw.appointmentStats || stats

  return {
    stats: {
      qualifiedToday: numberValue(stats.qualifiedToday),
      waitingForAssignment: numberValue(stats.waitingForAssignment, stats.waiting),
      assigned: numberValue(stats.assigned, stats.assignedLeads),
      accepted: numberValue(stats.accepted, stats.acceptedLeads),
      expired: numberValue(stats.expired, stats.expiredLeads),
      escalated: numberValue(stats.escalated, stats.escalatedLeads),
      averageResponseTime: textValue(stats.averageResponseTime, stats.responseTime) || '—',
    },
    appointments: {
      todaysAppointments: numberValue(
        appointments.todaysAppointments,
        appointments.todayAppointments,
      ),
      completedAppointments: numberValue(
        appointments.completedAppointments,
        appointments.completed,
      ),
      noShows: numberValue(appointments.noShows, appointments.noShow),
      appointmentConversion: numberValue(
        appointments.appointmentConversion,
        appointments.conversion,
      ),
    },
    salespeople: extractList(raw, ['salespeople', 'people']).map(mapPerson).filter(Boolean),
  }
}

const bdcDashboardService = { getBdcDashboard }

export default bdcDashboardService
