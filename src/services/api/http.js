import { API_BASE_URL } from '../../config/api'
import { startLoading, stopLoading } from '../../context/loadingStore'

const AUTH_STORAGE_KEY = 'model31_auth'

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
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  startLoading()
  try {
    let response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new ApiError(
        `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
      )
    }

    const payload = await response.json().catch(() => null)

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
