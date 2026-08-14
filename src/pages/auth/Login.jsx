import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { users, DEMO_PASSWORD } from '../../data/users'
import { getDashboardPathForRole } from '../../data/roles'
import { APP_NAME, APP_SUBTITLE } from '../../data/navigation'
import { cn } from '../../utils/cn'

const REMEMBER_EMAIL_KEY = 'autoflow_remember_email'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY))
    } catch {
      return false
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  useEffect(() => {
    document.title = `Sign In — ${APP_NAME}`
  }, [])

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Invalid email or password.')
      setPassword('')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.error || 'Invalid email or password.')
        setPassword('')
        return
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }

      navigate(result.redirectTo, { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoAccount = (demoUser) => {
    setEmail(demoUser.email)
    setPassword(DEMO_PASSWORD)
    setError('')
    setDemoOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-muted)] px-5 py-6 text-center sm:px-7">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary)] text-sm font-bold text-white">
            AF
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            {APP_NAME}
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
            {APP_SUBTITLE}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-7 sm:py-7">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-[var(--radius-md)] border border-[var(--status-error)]/30 bg-[var(--status-error-bg)] px-3 py-2.5 text-sm text-[var(--status-error)]"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@dealership.com"
              disabled={isSubmitting}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-accent)] hover:underline"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)]"
                disabled={isSubmitting}
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-sm font-medium text-[var(--brand-accent)] hover:underline"
              onClick={() => setForgotOpen(true)}
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="border-t border-[var(--border-default)] px-5 py-4 sm:px-7">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-[var(--text-primary)]"
            onClick={() => setDemoOpen((value) => !value)}
            aria-expanded={demoOpen}
          >
            Demo Accounts
            <ChevronDown
              size={16}
              className={cn(
                'text-[var(--text-muted)] transition-transform',
                demoOpen && 'rotate-180',
              )}
            />
          </button>

          {demoOpen && (
            <ul className="mt-3 space-y-2">
              {users.map((demoUser) => (
                <li
                  key={demoUser.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {demoUser.role}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {demoUser.email}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {DEMO_PASSWORD}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fillDemoAccount(demoUser)}
                    >
                      Use Account
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Forgot Password"
      >
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Password recovery will be connected later when the backend
          authentication service is available.
        </p>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setForgotOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}
