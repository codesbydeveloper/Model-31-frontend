import { apiRequest } from './http'
import { extractList, extractItem, extractPagination } from './payload'
import { mapAppointment } from './salespersonPortalService'

function toDisplayTime(value) {
  if (!value) return '10:00 AM'
  if (/am|pm/i.test(value)) return value
  const [h, m] = String(value).split(':').map(Number)
  if (!Number.isFinite(h)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${period}`
}

export async function getSalespersonAppointments({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const payload = await apiRequest(`/api/salesperson/appointments?${params.toString()}`)
  const items = extractList(payload, ['appointments']).map(mapAppointment).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getSalespersonAppointment(id) {
  const payload = await apiRequest(`/api/salesperson/appointments/${id}`)
  return mapAppointment(extractItem(payload, ['appointment']))
}

export async function createSalespersonAppointment(form) {
  const payload = await apiRequest('/api/salesperson/appointments', {
    method: 'POST',
    body: {
      customerName: String(form.customerName || '').trim(),
      vehicle: String(form.vehicle || '').trim(),
      appointmentType: form.type || form.appointmentType || 'Test Drive',
      date: form.date,
      time: toDisplayTime(form.time),
      notes: String(form.notes || '').trim(),
    },
  })
  return mapAppointment(extractItem(payload, ['appointment'])) || true
}

const salespersonAppointmentService = {
  getSalespersonAppointments,
  getSalespersonAppointment,
  createSalespersonAppointment,
}

export default salespersonAppointmentService
