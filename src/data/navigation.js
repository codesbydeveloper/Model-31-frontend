import { Home, LayoutGrid, Settings } from 'lucide-react'

export const APP_NAME = 'AutoFlow'
export const APP_SUBTITLE = 'AI Automotive BDC & Lead Dispatch Platform'

/** Step 1 foundation nav — retained for legacy foundation pages. */
export const SIDEBAR_NAV = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Modules', path: '/modules', icon: LayoutGrid },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export {
  ROLE_NAVIGATION,
  getNavForRole,
  findNavItemByPath,
  getSettingsPathForRole,
  getPageTitle,
  buildBreadcrumbs,
  SIDEBAR_COLLAPSED_KEY,
  FOOTER_NAV,
} from '../routes/navigation'
