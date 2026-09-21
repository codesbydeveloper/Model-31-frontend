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

function mapJob(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw._id || raw.roNumber || raw.repairOrderId || `ro_${index}`
  return {
    id: String(id),
    roNumber: textValue(raw.roNumber || raw.id, String(id)),
    customerName: textValue(raw.customerName || raw.customer || raw.name, 'Customer'),
    vehicle: textValue(raw.vehicle),
    phone: textValue(raw.phone),
    email: textValue(raw.email),
    appointmentAt: textValue(raw.appointmentAt || raw.appointment || raw.time),
    concern: textValue(raw.concern),
    statusLabel: textValue(raw.statusLabel || raw.status, 'Open'),
    advisorName: textValue(raw.advisorName || raw.advisor),
    technicianName: textValue(raw.technicianName || raw.technician),
    amount: numberValue(raw.amount),
    vin: textValue(raw.vin),
    mileage: numberValue(raw.mileage),
    hours: numberValue(raw.hours),
    delayReason: textValue(raw.delayReason || raw.reason),
    csi: textValue(raw.csi || raw.csiScore),
  }
}

export async function getServiceAdvisorDashboard() {
  const payload = await apiRequest('/api/service-advisor/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload?.data || payload
  const stats = raw.stats || raw.summary || raw

  return {
    greeting: textValue(raw.greeting),
    subtitle: textValue(raw.subtitle || raw.description),
    todaysAppointments: numberValue(stats.todaysAppointments, stats.todayAppointments),
    checkedIn: numberValue(stats.checkedIn),
    inWork: numberValue(stats.inWork),
    readyForPickup: numberValue(stats.readyForPickup, stats.ready),
    myJobsToday: extractList(raw, ['myJobsToday', 'jobs', 'items']).map(mapJob).filter(Boolean),
  }
}

export async function getServiceAdvisorAppointments() {
  const payload = await apiRequest('/api/service-advisor/appointments')
  return extractList(payload, ['appointments', 'jobs', 'items']).map(mapJob).filter(Boolean)
}

export async function getServiceAdvisorJobs() {
  const payload = await apiRequest('/api/service-advisor/jobs')
  return extractList(payload, ['jobs', 'items', 'repairOrders']).map(mapJob).filter(Boolean)
}

export async function getServiceAdvisorJob(id) {
  const payload = await apiRequest(`/api/service-advisor/jobs/${encodeURIComponent(id)}`)
  return mapJob(extractItem(payload, ['job', 'repairOrder', 'item']))
}

export default {
  getServiceAdvisorDashboard,
  getServiceAdvisorAppointments,
  getServiceAdvisorJobs,
  getServiceAdvisorJob,
}
