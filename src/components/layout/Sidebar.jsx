import { NavLink, useNavigate } from 'react-router-dom'
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from 'lucide-react'
import { APP_NAME, APP_SUBTITLE } from '../../data/navigation'
import {
  getNavForRole,
  getSettingsPathForRole,
} from '../../routes/navigation'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'
import MobileSidebar from './MobileSidebar'

function BrandMark({ collapsed }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3',
        collapsed && 'justify-center',
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/10 text-sm font-bold tracking-tight text-white">
        AF
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-[0.9375rem] font-semibold text-white">
            {APP_NAME}
          </p>
          <p className="mt-0.5 hidden truncate text-[0.6875rem] leading-tight text-white/55 lg:block">
            {APP_SUBTITLE}
          </p>
        </div>
      )}
    </div>
  )
}

function NavItem({ item, collapsed, onNavigate, touchFriendly }) {
  const Icon = item.icon

  return (
    <li>
      <NavLink
        to={item.path}
        title={collapsed ? item.label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
            touchFriendly ? 'px-3 py-3' : 'px-3 py-2.5',
            collapsed && 'justify-center px-2',
            isActive
              ? 'bg-[var(--bg-sidebar-active)] text-[var(--text-sidebar-active)]'
              : 'text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white',
          )
        }
      >
        <Icon size={18} strokeWidth={1.75} className="shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {collapsed && (
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-2 py-1 text-xs text-white shadow-[var(--shadow-md)] group-hover:block">
            {item.label}
          </span>
        )}
      </NavLink>
    </li>
  )
}

function FooterButton({
  collapsed,
  showLabel,
  title,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      title={collapsed ? title : undefined}
      className={cn(
        'mb-1 flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white',
        collapsed && 'justify-center px-2',
      )}
      onClick={onClick}
    >
      {children}
      {showLabel && <span>{title}</span>}
    </button>
  )
}

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = getNavForRole(user?.role)
  const settingsPath = getSettingsPathForRole(user?.role)
  const isCollapsedDesktop = collapsed && !open

  const handleLogout = () => {
    logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  const go = (path) => {
    onClose?.()
    navigate(path)
  }

  return (
    <>
      <MobileSidebar open={open} onClose={onClose} />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh flex-col overflow-hidden bg-[var(--bg-sidebar)] text-white shadow-[var(--shadow-md)] transition-[width,transform] duration-200 ease-out',
          'w-[min(18.5rem,calc(100vw-3rem))]',
          collapsed
            ? 'lg:w-[var(--sidebar-collapsed-width)]'
            : 'lg:w-[var(--sidebar-width)]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:shadow-none',
        )}
      >
        <div
          className={cn(
            'flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-white/10',
            isCollapsedDesktop ? 'justify-center px-2' : 'px-3',
          )}
        >
          <div className="min-w-0 flex-1">
            <BrandMark collapsed={isCollapsedDesktop} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-3 sm:px-3"
          aria-label="Main navigation"
          onWheel={(e) => e.stopPropagation()}
        >
          <ul className="flex flex-col gap-0.5 pb-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={isCollapsedDesktop}
                onNavigate={onClose}
                touchFriendly
              />
            ))}
          </ul>
        </nav>

        <div className="mt-auto shrink-0 border-t border-white/10 bg-[var(--bg-sidebar)] px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-3">
          <FooterButton
            collapsed={isCollapsedDesktop}
            showLabel={!isCollapsedDesktop}
            title="Profile"
            onClick={() => go('/profile')}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6875rem] font-semibold">
              {user?.avatar || 'U'}
            </span>
          </FooterButton>

          <FooterButton
            collapsed={isCollapsedDesktop}
            showLabel={!isCollapsedDesktop}
            title="Settings"
            onClick={() => go(settingsPath)}
          >
            <Settings size={18} strokeWidth={1.75} className="shrink-0" />
          </FooterButton>

          <FooterButton
            collapsed={isCollapsedDesktop}
            showLabel={!isCollapsedDesktop}
            title="Logout"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
          </FooterButton>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
