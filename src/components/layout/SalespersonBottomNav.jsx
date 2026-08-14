import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  ClipboardList,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const ITEMS = [
  { label: 'Dashboard', path: '/salesperson/dashboard', icon: LayoutDashboard },
  { label: 'Incoming', path: '/salesperson/incoming-leads', icon: Inbox },
  { label: 'Leads', path: '/salesperson/leads', icon: ClipboardList },
  { label: 'Messages', path: '/salesperson/conversations', icon: MessageSquare },
  { label: 'More', path: '/salesperson/commission', icon: MoreHorizontal },
]

export default function SalespersonBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-default)] bg-[var(--bg-surface)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-1 text-[11px] font-medium',
                    isActive
                      ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                      : 'text-[var(--text-secondary)]',
                  )
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
