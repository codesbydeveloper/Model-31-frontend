import { apiRequest } from './http'
import {
  extractList,
  extractItem,
  extractPagination,
  textValue,
} from './payload'
import { EVENT_STATUSES, EVENT_TYPES } from '../../data/events'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function toEventApiDate(value) {
  if (!value) return ''
  const text = String(value).trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

function formatEventTime(value) {
  if (value == null || value === '') return ''
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) return text.slice(0, 16)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return text
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function asOptions(raw, fallback, allLabel) {
  const items = (Array.isArray(raw) ? raw : fallback)
    .map((item) => textValue(item))
    .filter(Boolean)
  const source = items.length ? items : fallback
  const rest = source.filter((item) => !String(item).toLowerCase().startsWith('all '))
  const all = source.find((item) => String(item).toLowerCase().startsWith('all ')) || allLabel
  return [{ value: '', label: all }, ...rest.map((item) => ({ value: item, label: item }))]
}

export function mapEvent(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const durationRaw = raw.durationMs ?? raw.duration
  return {
    id: raw.id || raw._id || raw.eventId || `evt_${index + 1}`,
    eventType: textValue(raw.eventType || raw.type, '—'),
    source: textValue(raw.source, '—'),
    entity: textValue(raw.entity || raw.entityId, '—'),
    status: textValue(raw.status, 'PENDING').toUpperCase(),
    created: formatEventTime(raw.created || raw.timestamp || raw.createdAt) || '—',
    processed: formatEventTime(raw.processed || raw.processedAt) || null,
    durationMs: durationRaw == null || durationRaw === '' ? null : numberValue(durationRaw),
    payloadSummary: textValue(raw.payloadSummary || raw.summary || raw.message),
    payload: raw.payload && typeof raw.payload === 'object' ? raw.payload : null,
  }
}

export function mapEventDetail(payload) {
  const raw = extractItem(payload, ['event', 'item', 'quickView']) || payload
  const mapped = mapEvent(raw)
  if (!mapped) return null
  return {
    ...mapped,
    title: textValue(payload?.title || raw.title, 'Event Details'),
  }
}

const FALLBACK_OPTIONS = {
  eventTypes: asOptions(EVENT_TYPES, EVENT_TYPES, 'All event types'),
  statuses: asOptions(EVENT_STATUSES, EVENT_STATUSES, 'All statuses'),
  sources: [{ value: '', label: 'All sources' }],
}

export async function getEvents({
  search = '',
  eventType = '',
  status = '',
  source = '',
  date = '',
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)
  if (eventType && !String(eventType).toLowerCase().startsWith('all ')) {
    params.set('eventType', eventType)
  }
  if (status && !String(status).toLowerCase().startsWith('all ')) {
    params.set('status', status)
  }
  if (source && !String(source).toLowerCase().startsWith('all ')) {
    params.set('source', source)
  }
  const apiDate = toEventApiDate(date)
  if (apiDate) params.set('date', apiDate)

  const payload = await apiRequest(`/api/super-admin/events?${params.toString()}`)
  const options = payload.options || {}
  const items = extractList(payload, ['rows', 'events', 'items']).map(mapEvent).filter(Boolean)

  return {
    pageTitle: textValue(payload.pageTitle, 'Event Monitor'),
    description: textValue(payload.description, 'Monitor platform events and automation activity.'),
    options: {
      eventTypes: asOptions(options.eventTypes, EVENT_TYPES, 'All event types'),
      statuses: asOptions(options.statuses, EVENT_STATUSES, 'All statuses'),
      sources: asOptions(options.sources, [], 'All sources'),
    },
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getEventQuickView(id) {
  const payload = await apiRequest(`/api/super-admin/events/${id}/quick-view`)
  return mapEventDetail(payload)
}

export async function getEventById(id) {
  const payload = await apiRequest(`/api/super-admin/events/${id}`)
  return mapEventDetail(payload)
}

export { FALLBACK_OPTIONS }
