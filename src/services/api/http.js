import { API_BASE_URL } from '../../config/api'
import { startLoading, stopLoading } from '../../context/loadingStore'

const AUTH_STORAGE_KEY = 'model31_auth'
const LEGACY_USER_KEY = 'autoflow_user'
const LEGACY_TOKEN_KEY = 'autoflow_token'

let redirectingToLogin = false

function expireSession() {
  if (redirectingToLogin) return
  redirectingToLogin = true
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // Ignore storage failures in private mode
  }
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getAuthToken() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
    return parsed?.token || null
  } catch {
    return null
  }
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = getAuthToken()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = {}
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  startLoading()
  try {
    let response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      })
    } catch {
      throw new ApiError(
        `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
      )
    }

    const payload = await response.json().catch(() => null)

    if (response.status === 401 && !String(path).startsWith('/api/auth/login')) {
      expireSession()
    }

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        payload?.message || payload?.error || `Request failed (${response.status})`,
        response.status,
        payload,
      )
    }

    return payload
  } finally {
    stopLoading()
  }
}
