import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../data/roles'
import leadService from '../../services/mock/leadService'
import customerIdentityService from '../../services/mock/customerIdentityService'
import appointmentService from '../../services/mock/appointmentService'
import salespersonService from '../../services/mock/salespersonService'
import dealershipService from '../../services/mock/dealershipService'
import campaignService from '../../services/mock/campaignService'
import { cn } from '../../utils/cn'

export default function GlobalSearch() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState([])
  const [loading, setLoading] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    let active = true
    const t = window.setTimeout(async () => {
      setLoading(true)
      try {
        const [leads, customers, appts, people, dealers, campaigns] =
          await Promise.all([
            leadService.getLeads(),
            customerIdentityService.getCustomerIdentity(),
            appointmentService.getAppointments(),
            salespersonService.getSalespeople(),
            dealershipService.getDealerships(),
            campaignService.getCampaigns(),
          ])
        if (!active) return
        setIndex([
          ...leads.slice(0, 40).map((l) => ({
            type: 'Lead',
            name: l.customerName,
            status: l.status,
            id: l.id,
            path: pathForLead(user?.role, l.id),
          })),
          ...customers
            .filter((c) => c.status !== 'MERGED')
            .slice(0, 20)
            .map((c) => ({
              type: 'Customer',
              name: c.name,
              status: c.status,
              id: c.model31Id,
              path:
                user?.role === ROLES.SUPER_ADMIN
                  ? `/super-admin/customer-identity/${c.id}`
                  : null,
            })),
          ...appts.slice(0, 20).map((a) => ({
            type: 'Appointment',
            name: a.customerName,
            status: a.status,
            id: a.id,
            path:
              user?.role === ROLES.SALESPERSON
                ? `/salesperson/appointments/${a.id}`
                : null,
          })),
          ...people.map((p) => ({
            type: 'Salesperson',
            name: p.name,
            status: p.status,
            id: p.id,
            path:
              user?.role === ROLES.DEALERSHIP_ADMIN
                ? '/dealership/salespeople'
                : user?.role === ROLES.BDC_MANAGER
                  ? '/bdc/team'
                  : null,
          })),
          ...dealers.map((d) => ({
            type: 'Dealership',
            name: d.name,
            status: d.status,
            id: d.id,
            path:
              user?.role === ROLES.SUPER_ADMIN
                ? `/super-admin/dealerships/${d.id}`
                : null,
          })),
          ...campaigns.map((c) => ({
            type: 'Campaign',
            name: c.name,
            status: c.status,
            id: c.id,
            path:
              user?.role === ROLES.MARKETING_MANAGER
                ? `/marketing/campaigns/${c.id}`
                : null,
          })),
        ])
      } finally {
        if (active) setLoading(false)
      }
    }, 0)
    return () => {
      active = false
      window.clearTimeout(t)
    }
  }, [user?.role])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [index, query])

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search leads, customers…"
          aria-label="Global search"
          className="input-field with-leading-icon h-9 w-44 text-sm lg:w-64"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute right-0 z-50 mt-1 w-80 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg">
          {loading ? (
            <p className="px-3 py-4 text-sm text-[var(--text-secondary)]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-[var(--text-secondary)]">No results.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start px-3 py-2 text-left hover:bg-[var(--bg-muted)]',
                      !item.path && 'opacity-60',
                    )}
                    onClick={() => {
                      if (!item.path) return
                      setOpen(false)
                      setQuery('')
                      navigate(item.path)
                    }}
                  >
                    <span className="text-xs font-medium text-[var(--brand-accent)]">
                      {item.type}
                    </span>
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {item.id} · {item.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function pathForLead(role, id) {
  if (role === ROLES.SUPER_ADMIN) return `/super-admin/leads/${id}`
  if (role === ROLES.SALESPERSON) return `/salesperson/leads/${id}`
  if (role === ROLES.BDC_MANAGER) return `/bdc/conversations?lead=${id}`
  if (role === ROLES.DEALERSHIP_ADMIN) return `/dealership/leads`
  return null
}
