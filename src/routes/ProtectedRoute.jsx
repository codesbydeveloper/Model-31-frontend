import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children || null
}

export function AuthLoadingFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bg-app)]">
      <LoadingSpinner size={32} label="Loading session" />
    </div>
  )
}
