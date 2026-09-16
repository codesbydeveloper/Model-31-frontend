import { apiRequest } from './http'
import { mapLead } from './leadService'
import { mapScript } from './salespersonScriptService'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
  formatStamp,
} from './payload'

export function mapSalespersonLead(raw) {
  const lead = mapLead(raw)
  if (!lead) return null
  const notes = Array.isArray(raw.notes)
    ? raw.notes.map((note, index) =>
        typeof note === 'string'
          ? { id: `note_${index}`, text: note, author: '', time: '' }
          : {
              id: note.id || `note_${index}`,
              text: textValue(note.note || note.text || note.body),
              author: textValue(note.author || note.createdBy),
              time: formatStamp(note.time || note.createdAt) || textValue(note.time),
            },
      )
    : []
  const activity = Array.isArray(raw.activity || raw.timeline)
    ? (raw.activity || raw.timeline).map((item, index) => ({
        id: item.id || `act_${index}`,
        description: textValue(item.description || item.event || item.message),
        actor: textValue(item.actor || item.user),
        time: formatStamp(item.time || item.createdAt) || textValue(item.time),
      }))
    : lead.activity || []

  return {
    ...lead,
    budget: textValue(raw.budget) || lead.budget,
    timeline: textValue(raw.timeline) || lead.timeline,
    location: textValue(raw.location || raw.city) || lead.city,
    financing: textValue(raw.financing) || lead.financing,
    expiresIn: Number(raw.expiresIn ?? raw.expiresInSeconds) || 0,
    notes,
    activity,
  }
}

export function mapAppointment(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.appointmentId,
    customerName: textValue(raw.customerName),
    vehicle: textValue(raw.vehicle),
    type: textValue(raw.appointmentType || raw.type) || 'Test Drive',
    date: textValue(raw.date),
    time: textValue(raw.time),
    notes: textValue(raw.notes),
    status: textValue(raw.status) || 'SCHEDULED',
    dealership: textValue(raw.dealership),
    salesperson: textValue(raw.salesperson),
    leadId: raw.leadId || raw.lead?.id || '',
    phone: textValue(raw.phone),
    email: textValue(raw.email),
    activity: Array.isArray(raw.activity) ? raw.activity : [],
  }
}

export function mapSoldDeal(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.dealId,
    leadId: raw.leadId || raw.lead?.id || '',
    customerName: textValue(raw.customerName),
    vehicle: textValue(raw.vehicle),
    dealership: textValue(raw.dealership),
    salePrice: Number(raw.salePrice ?? raw.dealAmount ?? raw.amount) || 0,
    saleDate: formatStamp(raw.saleDate || raw.createdAt) || textValue(raw.saleDate),
    notes: textValue(raw.notes),
    paymentMethod: textValue(raw.paymentMethod),
    commission: Number(raw.commission ?? raw.totalCommission) || 0,
    commissionStatus: textValue(raw.commissionStatus || raw.status) || 'PENDING',
  }
}

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

export async function getSalespersonDashboard() {
  const payload = await apiRequest('/api/salesperson/dashboard')
  const raw = extractItem(payload, ['dashboard']) || payload?.data || payload
  const stats = raw.stats || raw.summary || raw
  const presenceRaw = textValue(
    raw.presence || raw.user?.presence || stats.presence,
  )
  const statusRaw = textValue(raw.status || stats.status)
  const presence =
    presenceRaw ||
    (/^(ONLINE|OFFLINE)$/i.test(statusRaw) ? statusRaw : '') ||
    'OFFLINE'
  return {
    name: textValue(raw.name || raw.salesperson),
    dealership: textValue(raw.dealership),
    status: presence.toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
    stats: {
      todaysLeads: numberValue(stats.todaysLeads, stats.todayLeads),
      accepted: numberValue(stats.accepted, stats.acceptedLeads),
      declined: numberValue(stats.declined, stats.declinedLeads),
      appointments: numberValue(stats.appointments),
      todaysAppointments: numberValue(
        stats.todaysAppointments,
        raw.todaysAppointments?.length,
      ),
      upcoming: numberValue(stats.upcoming, raw.upcomingAppointments?.length),
      soldThisMonth: numberValue(stats.soldThisMonth, stats.currentMonthSales),
      commission: numberValue(
        stats.commission,
        stats.currentMonthCommission,
        raw.commission?.currentMonthCommission,
      ),
    },
    todayAppointments: extractList(
      raw.todayAppointments || raw.todaysAppointments || [],
    )
      .map(mapAppointment)
      .filter(Boolean),
    upcomingAppointments: extractList(raw.upcomingAppointments || [])
      .map(mapAppointment)
      .filter(Boolean),
    recentSoldDeals: extractList(raw.recentSoldDeals || raw.soldDeals || [])
      .map(mapSoldDeal)
      .filter(Boolean),
    pendingScripts: extractList(raw.pendingScripts || raw.scripts || [])
      .map(mapScript)
      .filter(Boolean),
    commission: {
      currentMonthSales: numberValue(
        raw.commission?.currentMonthSales,
        stats.soldThisMonth,
      ),
      currentMonthCommission: numberValue(
        raw.commission?.currentMonthCommission,
        stats.commission,
      ),
      pendingCommission: numberValue(raw.commission?.pendingCommission),
    },
  }
}

export async function updateSalespersonPresence(presence) {
  const payload = await apiRequest('/api/salesperson/presence', {
    method: 'PATCH',
    body: { presence },
  })
  const raw = extractItem(payload, ['salesperson', 'user']) || payload?.data || payload
  const next = textValue(raw.presence || raw.status || presence)
  return { status: next.toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE' }
}

export async function getIncomingLeads() {
  const payload = await apiRequest('/api/salesperson/incoming-leads')
  const list = extractList(payload, ['leads', 'offers', 'incomingLeads'])
    .map(mapSalespersonLead)
    .filter(Boolean)
  if (list.length) return list
  const item = mapSalespersonLead(extractItem(payload, ['lead', 'offer']))
  return item?.id ? [item] : []
}

export async function acceptIncomingLead(id) {
  await apiRequest(`/api/salesperson/incoming-leads/${id}/accept`, { method: 'PATCH' })
  return true
}

export async function declineIncomingLead(id) {
  await apiRequest(`/api/salesperson/incoming-leads/${id}/decline`, { method: 'PATCH' })
  return true
}

export async function getMyLeads({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (status && status !== 'all') params.set('status', status)
  const payload = await apiRequest(`/api/salesperson/leads?${params.toString()}`)
  const items = extractList(payload, ['leads']).map(mapSalespersonLead).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getMyLead(id) {
  const payload = await apiRequest(`/api/salesperson/leads/${id}`)
  const data =
    payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? payload.data
      : payload
  const lead = mapSalespersonLead(data.lead || extractItem(payload, ['lead']))
  if (!lead) return null
  lead.salesScript = mapScript(data.salesScript || data.script || null)
  return lead
}

export async function updateMyLeadStatus(id, status) {
  const payload = await apiRequest(`/api/salesperson/leads/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return mapSalespersonLead(extractItem(payload, ['lead'])) || true
}

export async function addMyLeadNote(id, note) {
  const payload = await apiRequest(`/api/salesperson/leads/${id}/notes`, {
    method: 'POST',
    body: { note },
  })
  return mapSalespersonLead(extractItem(payload, ['lead'])) || true
}

export async function markMyLeadSold(id, { dealAmount, paymentMethod }) {
  const payload = await apiRequest(`/api/salesperson/leads/${id}/sold`, {
    method: 'PATCH',
    body: { dealAmount: Number(dealAmount) || 0, paymentMethod },
  })
  return mapSalespersonLead(extractItem(payload, ['lead'])) || true
}

export async function markMyLeadNotSold(id) {
  const payload = await apiRequest(`/api/salesperson/leads/${id}/not-sold`, {
    method: 'PATCH',
  })
  return mapSalespersonLead(extractItem(payload, ['lead'])) || true
}

const salespersonPortalService = {
  getSalespersonDashboard,
  updateSalespersonPresence,
  getIncomingLeads,
  acceptIncomingLead,
  declineIncomingLead,
  getMyLeads,
  getMyLead,
  updateMyLeadStatus,
  addMyLeadNote,
  markMyLeadSold,
  markMyLeadNotSold,
}

export default salespersonPortalService
