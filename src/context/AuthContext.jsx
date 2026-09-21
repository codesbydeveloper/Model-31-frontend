import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { login as loginWithApi } from '../services/api/authService'
import { getDashboardPathForRole, ROLES } from '../data/roles'
import { DEMO_ROLE_USERS } from '../data/demoServiceRoles'

const AUTH_STORAGE_KEY = 'model31_auth'
const LEGACY_USER_KEY = 'autoflow_user'
const LEGACY_TOKEN_KEY = 'autoflow_token'

const DEMO_ROLES = [
  ROLES.SERVICE_ADVISOR,
  ROLES.SERVICE_MANAGER,
  ROLES.SERVICE_MERCHANDISING,
]

function isDemoSession(parsed) {
  return parsed?.source === 'demo' && DEMO_ROLES.includes(parsed?.user?.role)
}

function clearLegacyDummySession() {
  try {
    localStorage.removeItem(LEGACY_USER_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // Ignore storage failures in private mode
  }
}

function readStoredAuth() {
  clearLegacyDummySession()

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return { user: null, token: null }

    const parsed = JSON.parse(raw)
    if (!parsed?.user?.role) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return { user: null, token: null }
    }

    if (parsed.source !== 'api' && !isDemoSession(parsed)) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return { user: null, token: null }
    }

    return {
      user: parsed.user,
      token: parsed.token || null,
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return { user: null, token: null }
  }
}

function persistAuth(user, token, source = 'api') {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      source,
      user,
      token: token || null,
    }),
  )
}

export function AuthProvider({ children }) {
  const initial = readStoredAuth()
  const [user, setUser] = useState(initial.user)
  const [token, setToken] = useState(initial.token)

  const login = useCallback(async (email, password) => {
    const result = await loginWithApi(email, password)

    if (!result.success) {
      return result
    }

    persistAuth(result.user, result.token, 'api')
    setUser(result.user)
    setToken(result.token || null)

    return {
      success: true,
      user: result.user,
      token: result.token || null,
      redirectTo: getDashboardPathForRole(result.user.role),
    }
  }, [])

  const loginDemoRole = useCallback((role) => {
    const user = DEMO_ROLE_USERS[role]
    if (!user) {
      return { success: false, error: 'That demo role is not available.' }
    }

    persistAuth(user, 'demo-token', 'demo')
    setUser(user)
    setToken('demo-token')

    return {
      success: true,
      user,
      token: 'demo-token',
      redirectTo: getDashboardPathForRole(user.role),
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    clearLegacyDummySession()
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      token,
      isAuthenticated: Boolean(user),
      login,
      loginDemoRole,
      logout,
    }),
    [user, token, login, loginDemoRole, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
