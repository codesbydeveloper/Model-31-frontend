import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
  getPageTitle,
  getSettingsPathForRole,
} from '../../routes/navigation'
import { ROLES } from '../../data/roles'
import Button from '../common/Button'
import GlobalSearch from './GlobalSearch'
import { cn } from '../../utils/cn'
import notificationService from '../../services/api/notificationService'

export default function TopHeader({ onMenuClick }) {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const pageTitle = getPageTitle(location.pathname, user?.role)
  const settingsPath = getSettingsPathForRole(user?.role)

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
      if (!notifRef.current?.contains(event.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (token === 'demo-token') {
      setNotifications([])
      return undefined
    }
    const t = window.setTimeout(async () => {
      try {
        const rows = await notificationService.getNotifications()
        setNotifications(rows.filter((n) => !n.read).slice(0, 5))
      } catch {
        setNotifications([])
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [user?.role, token])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const unread = notifications.filter((n) => !n.read).length

  const notificationsPath =
    user?.role === ROLES.SUPER_ADMIN
      ? '/super-admin/notifications'
      : user?.role === ROLES.MARKETING_MANAGER
        ? '/marketing/dashboard'
        : null

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu size={20} />
          </Button>
        </div>
        <h1 className="truncate text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <GlobalSearch />

        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            title="Notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
            className="relative"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--status-error)]" />
            )}
          </Button>
          {notifOpen && (
            <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
              <div className="border-b border-[var(--border-default)] px-3 py-2">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-3 py-4 text-sm text-[var(--text-secondary)]">
                    No unread notifications.
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      className="border-b border-[var(--border-default)] px-3 py-2 last:border-0"
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {n.description || n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {n.date || n.time}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              {notificationsPath && (
                <button
                  type="button"
                  className="w-full border-t border-[var(--border-default)] px-3 py-2 text-left text-sm font-medium text-[var(--brand-accent)] hover:bg-[var(--bg-muted)]"
                  onClick={() => {
                    setNotifOpen(false)
                    navigate(notificationsPath)
                  }}
                >
                  View all
                </button>
              )}
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            className={cn(
              'flex max-w-[240px] items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-[var(--bg-muted)]',
              menuOpen && 'bg-[var(--bg-muted)]',
            )}
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-xs font-semibold text-[var(--brand-accent)]">
              {user?.avatar || <User size={14} />}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                {user?.name || 'User'}
              </span>
              <span className="block truncate text-xs text-[var(--text-secondary)]">
                {user?.role}
              </span>
            </span>
            <ChevronDown
              size={14}
              className="hidden text-[var(--text-muted)] sm:block"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]"
            >
              <div className="border-b border-[var(--border-default)] px-3 py-2 sm:hidden">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {user?.role}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile')
                }}
              >
                <User size={16} />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(settingsPath)
                }}
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
