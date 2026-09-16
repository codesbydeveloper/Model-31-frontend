import { apiRequest } from './http'
import { normalizeRole } from '../../data/roles'

function extractList(payload) {
  if (Array.isArray(payload)) return payload
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(data?.items)) return data.items
  return []
}

function extractItem(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.id || payload._id || payload.email) return payload
  const data = payload.data
  if (data && typeof data === 'object') {
    if (data.id || data._id || data.email) return data
    if (data.user) return data.user
  }
  return payload.user || null
}

function extractPagination(payload, { page, limit, itemCount }) {
  const meta =
    payload?.pagination ||
    payload?.meta ||
    payload?.data?.pagination ||
    payload?.data?.meta ||
    (payload?.data && !Array.isArray(payload.data) ? payload.data : null) ||
    payload

  const total = Number(
    meta?.total ??
      meta?.totalItems ??
      meta?.totalCount ??
      payload?.total ??
      payload?.count ??
      itemCount,
  )
  const currentPage = Number(meta?.page ?? meta?.currentPage ?? page) || page
  const pageSize = Number(meta?.limit ?? meta?.pageSize ?? limit) || limit
  const totalPages = Number(
    meta?.totalPages ??
      meta?.pages ??
      Math.max(1, Math.ceil((total || 0) / pageSize)),
  )

  return {
    page: currentPage,
    limit: pageSize,
    total: Number.isFinite(total) ? total : itemCount,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function namedValue(value, fallback = '') {
  if (value == null || value === '') return fallback
  if (typeof value === 'string') return value
  return value.name || value.label || value.title || fallback
}

export function mapUser(raw) {
  if (!raw || typeof raw !== 'object') return null

  const dealershipId =
    raw.dealershipId || raw.dealership?.id || raw.dealership?._id || null
  const dealership =
    namedValue(raw.dealershipName) ||
    namedValue(raw.dealership) ||
    (dealershipId ? '—' : 'Unassigned')

  return {
    id: raw.id || raw._id || raw.userId,
    name: raw.name || '',
    email: raw.email || '',
    role: normalizeRole(raw.role) || raw.role || '',
    dealership,
    dealershipId,
    phone: raw.phone || '',
    status: raw.status || 'Active',
    lastActive: formatDateTime(
      raw.lastActive || raw.lastActiveAt || raw.lastLoginAt || raw.updatedAt,
    ),
    createdDate: formatDate(raw.createdDate || raw.createdAt),
    currentLeads: Number(
      raw.currentLeads ?? raw.activeLeads ?? raw.leadCount ?? 0,
    ) || 0,
  }
}

function availabilityStatus(raw, fallback = 'OFFLINE') {
  const value = String(
    raw.availability ||
      raw.presence ||
      raw.onlineStatus ||
      raw.agentStatus ||
      raw.status ||
      fallback,
  ).toUpperCase()
  if (['ONLINE', 'OFFLINE', 'BUSY'].includes(value)) return value
  if (value === 'ACTIVE' || value === 'AVAILABLE') return 'ONLINE'
  if (value === 'INACTIVE' || value === 'DISABLED') return 'OFFLINE'
  return fallback
}

export function mapSalesperson(raw) {
  const user = mapUser(raw)
  if (!user) return null
  return {
    ...user,
    status: availabilityStatus(raw, user.status || 'OFFLINE'),
  }
}

function toApiPayload(form) {
  const dealershipId =
    !form.dealership || form.dealership === 'Unassigned'
      ? null
      : form.dealership

  const payload = {
    name: String(form.name || '').trim(),
    email: String(form.email || '').trim(),
    role: form.role,
    dealershipId,
    phone: String(form.phone || '').trim(),
    status: form.status || 'Active',
  }

  const password = String(form.password || '').trim()
  if (password) payload.password = password

  return payload
}

export async function getUsers({
  page = 1,
  limit = 10,
  search = '',
  role = '',
  status = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const query = String(search || '').trim()
  if (query) params.set('search', query)
  if (role && role !== 'all') params.set('role', role)
  if (status && status !== 'all') params.set('status', status)

  const payload = await apiRequest(`/api/users?${params.toString()}`)
  const items = extractList(payload).map(mapUser).filter(Boolean)
  return {
    items,
    ...extractPagination(payload, { page, limit, itemCount: items.length }),
  }
}

export async function getSalespeople() {
  const payload = await apiRequest('/api/users?role=Salesperson&limit=100')
  return extractList(payload).map(mapSalesperson).filter(Boolean)
}

export async function createUser(form) {
  const payload = await apiRequest('/api/users', {
    method: 'POST',
    body: toApiPayload(form),
  })
  return mapUser(extractItem(payload)) || true
}

export async function updateUser(id, form) {
  const payload = await apiRequest(`/api/users/${id}`, {
    method: 'PUT',
    body: toApiPayload(form),
  })
  return mapUser(extractItem(payload)) || true
}

export async function deleteUser(id) {
  await apiRequest(`/api/users/${id}`, { method: 'DELETE' })
  return true
}

const userService = {
  getUsers,
  getSalespeople,
  createUser,
  updateUser,
  deleteUser,
}

export default userService
