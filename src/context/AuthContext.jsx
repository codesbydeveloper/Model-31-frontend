import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { mockLogin } from '../services/mock/authService'
import { getDashboardPathForRole } from '../data/roles'

const STORAGE_KEY = 'autoflow_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())

  const login = useCallback(async (email, password) => {
    const result = await mockLogin(email, password)

    if (!result.success) {
      return result
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
    setUser(result.user)

    return {
      success: true,
      user: result.user,
      redirectTo: getDashboardPathForRole(result.user.role),
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
