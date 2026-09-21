import { API_BASE_URL } from '../../config/api'
import { withLoading } from '../../context/loadingStore'
import { normalizeRole } from '../../data/roles'

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function dealershipName(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name || value.title || ''
}

function mapUser(raw, fallbackEmail) {
  if (!raw || typeof raw !== 'object') return null

  const name = raw.name || raw.fullName || [raw.firstName, raw.lastName].filter(Boolean).join(' ')
  const email = raw.email || fallbackEmail
  const role = normalizeRole(raw.role || raw.roleName)

  return {
    id: raw.id || raw._id || raw.userId || email,
    name: name || email,
    email,
    role,
    avatar: raw.avatar || initialsFromName(name || email),
    status: String(raw.status || 'active').toLowerCase(),
    dealership: dealershipName(raw.dealership || raw.dealershipName),
    salespersonId: raw.salespersonId || raw.salesperson_id || null,
  }
}

function extractPayload(body) {
  const data = body?.data && typeof body.data === 'object' ? body.data : body
  return {
    user: data?.user || body?.user || (data?.email || data?.role ? data : null),
    token: data?.token || data?.accessToken || body?.token || body?.accessToken || null,
  }
}

export async function login(email, password) {
  try {
    const response = await withLoading(() =>
      fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }),
    )

    const body = await response.json().catch(() => null)

    if (!response.ok || body?.success === false) {
      return {
        success: false,
        error: body?.message || body?.error || 'Invalid email or password.',
      }
    }

    const { user: rawUser, token } = extractPayload(body)
    const user = mapUser(rawUser, email.trim())

    if (!user?.role) {
      return {
        success: false,
        error: 'Login succeeded but the user role was missing.',
      }
    }

    if (user.status && user.status !== 'active') {
      return {
        success: false,
        error: 'This account is inactive.',
      }
    }

    return { success: true, user, token }
  } catch {
    return {
      success: false,
      error: `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
    }
  }
}

export default { login }
