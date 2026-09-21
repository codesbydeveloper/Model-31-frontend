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

function mapRepairOrder(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw._id || raw.roNumber || raw.repairOrderId || `ro_${index}`
  return {
    id: String(id),
    roNumber: textValue(raw.roNumber || raw.id, String(id)),
    customerName: textValue(raw.customerName || raw.customer || raw.name, 'Customer'),
    vehicle: textValue(raw.vehicle),
    advisorName: textValue(raw.advisorName || raw.advisor),
    technicianName: textValue(raw.technicianName || raw.technician),
    statusLabel: textValue(raw.statusLabel || raw.status, 'Open'),
    amount: numberValue(raw.amount),
    phone: textValue(raw.phone),
    email: textValue(raw.email),
    appointmentAt: textValue(raw.appointmentAt || raw.appointment),
    vin: textValue(raw.vin),
    mileage: numberValue(raw.mileage),
    concern: textValue(raw.concern),
    hours: numberValue(raw.hours),
    delayReason: textValue(raw.delayReason || raw.reason),
    csi: textValue(raw.csi || raw.csiScore),
  }
}

function mapJob(raw, index = 0) {
  const job = mapRepairOrder(raw, index)
  if (!job) return null
  return {
    id: job.id,
    customerName: job.customerName,
    delayReason: job.delayReason,
    status: job.statusLabel,
  }
}

function mapAdvisor(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.advisorId || `adv_${index}`,
    name: textValue(raw.name || raw.fullName, 'Advisor'),
    openJobs: numberValue(raw.openJobs, raw.open, raw.currentJobs),
    completedToday: numberValue(raw.completedToday, raw.completed, raw.done),
    delayed: numberValue(raw.delayed, raw.delayedJobs),
    csi: numberValue(raw.csi, raw.csiScore),
  }
}

export async function getServiceManagerDashboard() {
  const payload = await apiRequest('/api/service-manager/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload?.data || payload
  const stats = raw.stats || raw.summary || raw

  return {
    dealership: textValue(raw.dealership || raw.dealershipName || stats.dealership),
    openJobs: numberValue(stats.openJobs, stats.open, raw.openJobs),
    delayedJobs: numberValue(
      stats.delayedJobs,
      stats.delayed,
      stats.waitingOnParts,
      raw.delayedJobs,
    ),
    completedJobs: numberValue(
      stats.completedJobs,
      stats.completed,
      stats.delivered,
      raw.completedJobs,
    ),
    hoursBilled: numberValue(stats.hoursBilled, stats.hours, raw.hoursBilled),
    delayed: extractList(raw, ['delayedJobs', 'delayed', 'jobs'])
      .map(mapJob)
      .filter(Boolean),
    advisors: extractList(raw, ['advisors', 'serviceAdvisors', 'people'])
      .map(mapAdvisor)
      .filter(Boolean),
  }
}

export async function getServiceManagerJobs() {
  const payload = await apiRequest('/api/service-manager/jobs')
  return extractList(payload, ['jobs', 'items', 'repairOrders'])
    .map(mapRepairOrder)
    .filter(Boolean)
}

export async function getServiceManagerJob(id) {
  const payload = await apiRequest(`/api/service-manager/jobs/${encodeURIComponent(id)}`)
  return mapRepairOrder(extractItem(payload, ['job', 'repairOrder', 'item']))
}

export async function getServiceManagerAdvisors() {
  const payload = await apiRequest('/api/service-manager/advisors')
  return extractList(payload, ['advisors', 'items', 'serviceAdvisors'])
    .map(mapAdvisor)
    .filter(Boolean)
}

export async function getServiceManagerDelayed() {
  const payload = await apiRequest('/api/service-manager/delayed')
  return extractList(payload, ['jobs', 'items', 'delayedJobs', 'delayed'])
    .map(mapRepairOrder)
    .filter(Boolean)
}

export default {
  getServiceManagerDashboard,
  getServiceManagerJobs,
  getServiceManagerJob,
  getServiceManagerAdvisors,
  getServiceManagerDelayed,
}
