import { delay } from '../../utils/delay'
import {
  appointmentStatsOverview,
  bdcAppointmentStats,
  initialAppointments,
} from '../../data/appointments'
import { pushLeadActivity } from './salespersonService'

let appointments = structuredClone(initialAppointments)

function nowStamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pushActivity(apt, description, actor = 'John Smith') {
  apt.activity = [
    {
      id: `aa_${Date.now()}`,
      description,
      actor,
      time: nowStamp(),
    },
    ...(apt.activity || []),
  ]
}

function computeStats(list) {
  const today = '2026-08-14'
  return {
    todaysAppointments: list.filter((a) => a.date === today).length,
    upcoming: list.filter(
      (a) =>
        a.date >= today &&
        (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'),
    ).length,
    confirmed: list.filter((a) => a.status === 'CONFIRMED').length,
    completed: list.filter((a) => a.status === 'COMPLETED').length,
    noShow: list.filter((a) => a.status === 'NO SHOW').length,
    cancelled: list.filter((a) => a.status === 'CANCELLED').length,
  }
}

void computeStats


export async function getAppointmentStats(salespersonId) {
  await delay(250)
  // Card totals use curated demo overview; list/calendar use live mock rows.
  void salespersonId
  return { ...appointmentStatsOverview }
}

export async function getBdcAppointmentStats() {
  await delay(250)
  return { ...bdcAppointmentStats }
}

export async function getAppointments(salespersonId) {
  await delay(300)
  // Salesperson portal demo shows the full mock calendar book.
  void salespersonId
  return structuredClone(appointments)
}

export async function getAppointmentById(id) {
  await delay(250)
  const item = appointments.find((a) => a.id === id)
  return item ? structuredClone(item) : null
}

export async function getUpcomingAppointments(salespersonId, limit = 5) {
  await delay(250)
  const today = '2026-08-14'
  void salespersonId
  return structuredClone(
    appointments
      .filter(
        (a) =>
          a.date >= today &&
          (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'),
      )
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      .slice(0, limit),
  )
}

export async function createAppointment(payload) {
  await delay(650)
  const created = {
    id: `apt_${Date.now()}`,
    leadId: payload.leadId || '',
    customerName: payload.customerName,
    phone: payload.phone || '',
    email: payload.email || '',
    vehicle: payload.vehicle,
    type: payload.type || 'Dealership Visit',
    date: payload.date,
    time: payload.time,
    dealership: payload.dealership || 'Miami Luxury Motors',
    salesperson: payload.salesperson || 'John Smith',
    salespersonId: payload.salespersonId || 'sp_001',
    status: 'SCHEDULED',
    notes: payload.notes || '',
    customerReminder: true,
    salespersonReminder: true,
    activity: [],
  }
  pushActivity(created, 'Appointment scheduled', payload.salesperson || 'John Smith')
  appointments = [created, ...appointments]
  if (created.leadId) {
    pushLeadActivity(created.leadId, 'Appointment scheduled', created.salesperson)
  }
  return structuredClone(created)
}

export async function scheduleAppointment(payload) {
  return createAppointment(payload)
}

export async function updateAppointment(id, payload) {
  await delay(500)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index] = { ...appointments[index], ...payload, id }
  return structuredClone(appointments[index])
}

export async function confirmAppointment(id) {
  await delay(500)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index].status = 'CONFIRMED'
  pushActivity(appointments[index], 'Appointment confirmed')
  if (appointments[index].leadId) {
    pushLeadActivity(appointments[index].leadId, 'Appointment confirmed')
  }
  return structuredClone(appointments[index])
}

export async function rescheduleAppointment(id, { date, time, notes }) {
  await delay(600)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index] = {
    ...appointments[index],
    date,
    time,
    notes: notes ?? appointments[index].notes,
    status: 'SCHEDULED',
  }
  pushActivity(
    appointments[index],
    `Appointment rescheduled to ${date} ${time}`,
  )
  if (appointments[index].leadId) {
    pushLeadActivity(appointments[index].leadId, 'Appointment rescheduled')
  }
  return structuredClone(appointments[index])
}

export async function completeAppointment(id) {
  await delay(500)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index].status = 'COMPLETED'
  pushActivity(appointments[index], 'Appointment completed')
  if (appointments[index].leadId) {
    pushLeadActivity(appointments[index].leadId, 'Appointment completed')
  }
  return structuredClone(appointments[index])
}

export async function markNoShow(id) {
  await delay(500)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index].status = 'NO SHOW'
  pushActivity(appointments[index], 'Customer no show')
  if (appointments[index].leadId) {
    pushLeadActivity(appointments[index].leadId, 'Customer no show')
  }
  return structuredClone(appointments[index])
}

export async function cancelAppointment(id, reason = '') {
  await delay(550)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  appointments[index].status = 'CANCELLED'
  appointments[index].cancellationReason = reason
  pushActivity(appointments[index], 'Appointment cancelled')
  if (appointments[index].leadId) {
    pushLeadActivity(appointments[index].leadId, 'Appointment cancelled')
  }
  return structuredClone(appointments[index])
}

export async function updateReminders(id, { customerReminder, salespersonReminder }) {
  await delay(300)
  const index = appointments.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Appointment not found')
  if (typeof customerReminder === 'boolean') {
    appointments[index].customerReminder = customerReminder
  }
  if (typeof salespersonReminder === 'boolean') {
    appointments[index].salespersonReminder = salespersonReminder
  }
  return structuredClone(appointments[index])
}

const appointmentService = {
  getAppointmentStats,
  getBdcAppointmentStats,
  getAppointments,
  getAppointmentById,
  getUpcomingAppointments,
  createAppointment,
  scheduleAppointment,
  updateAppointment,
  confirmAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow,
  cancelAppointment,
  updateReminders,
}

export default appointmentService
