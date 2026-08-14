import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import TopHeader from '../components/layout/TopHeader'
import SalespersonBottomNav from '../components/layout/SalespersonBottomNav'
import { SIDEBAR_COLLAPSED_KEY } from '../routes/navigation'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../data/roles'

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function MainLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)
  const isSalesperson = user?.role === ROLES.SALESPERSON

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // Ignore storage failures in private mode
    }
  }, [collapsed])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setSidebarOpen(false)
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="flex min-h-svh w-full overflow-x-hidden bg-[var(--bg-app)]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      {/* Desktop spacer so fixed sidebar does not cover content */}
      <div
        aria-hidden
        className={`hidden shrink-0 lg:block ${
          collapsed
            ? 'w-[var(--sidebar-collapsed-width)]'
            : 'w-[var(--sidebar-width)]'
        }`}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        <main
          className={`flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 ${
            isSalesperson ? 'pb-24 md:pb-6' : ''
          }`}
        >
          <Outlet />
        </main>
        {isSalesperson ? <SalespersonBottomNav /> : null}
      </div>
    </div>
  )
}
