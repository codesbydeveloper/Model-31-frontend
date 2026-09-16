import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber, formatPercent } from '../../utils/table'
import dealershipService from '../../services/api/dealershipService'

const TABS = [
  'Overview',
  'Salespeople',
  'Leads',
  'Conversations',
  'CRM',
  'Social Accounts',
  'Settings',
  'Reports',
]

export default function DealershipDetailPage() {
  const { id } = useParams()
  const [dealership, setDealership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')
  const [salespeople, setSalespeople] = useState([])
  const [leads, setLeads] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await dealershipService.getDealershipById(id)
        if (active) setDealership(data)
        const [staff, leadRows] = await Promise.all([
          dealershipService.getDealershipStaff(id).catch(() => []),
          dealershipService.getDealershipLeadList(id).catch(() => []),
        ])
        if (active) {
          setSalespeople(staff)
          setLeads(leadRows)
        }
      } catch {
        if (active) setDealership(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!dealership) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <h1 className="text-xl font-semibold">Dealership not found</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            The dealership you requested could not be loaded.
          </p>
          <Link to="/super-admin/dealerships" className="mt-4 inline-block">
            <Button variant="secondary">
              <ArrowLeft size={16} />
              Back to Dealerships
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-4">
        <Link to="/super-admin/dealerships">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>

      <PageHeader
        title={dealership.name}
        description={`${dealership.city}, ${dealership.state}`}
        actions={<StatusBadge status={dealership.status} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Leads" value={formatNumber(dealership.totalLeads)} />
        <StatCard
          label="Qualified Leads"
          value={formatNumber(dealership.qualifiedLeads)}
        />
        <StatCard
          label="Salespeople"
          value={formatNumber(dealership.salespeople)}
        />
        <StatCard
          label="Closed Deals"
          value={formatNumber(dealership.closedDeals)}
        />
        <StatCard
          label="Conversion Rate"
          value={formatPercent(dealership.conversionRate)}
        />
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-[var(--border-default)] pb-px">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`shrink-0 rounded-t-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
              tab === item
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-[inset_0_-2px_0_var(--brand-accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <Card className="mt-4 rounded-tl-none">
        {tab === 'Overview' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Address" value={dealership.address} />
            <Info label="Phone" value={dealership.phone} />
            <Info label="Website" value={dealership.website} />
            <Info label="Timezone" value={dealership.timezone} />
            <Info label="Brands" value={(dealership.brands || []).join(', ')} />
            <Info label="ZIP" value={dealership.zip} />
            <Info label="CRM Status" value={dealership.crmStatus} />
            <Info label="Social Status" value={dealership.socialStatus} />
          </div>
        )}

        {tab === 'Salespeople' && (
          <ItemList
            empty="No salespeople assigned to this dealership."
            items={salespeople.map((u) => ({
              title: u.name,
              meta: `${u.role} · ${u.status}`,
            }))}
          />
        )}

        {tab === 'Leads' && (
          <ItemList
            empty="No leads for this dealership."
            items={leads.map((l) => ({
              title: `${l.id} · ${l.name}`,
              meta: `${l.source} · Score ${l.score} · ${l.status}`,
            }))}
          />
        )}

        {tab === 'Conversations' && (
          <p className="text-sm text-[var(--text-secondary)]">
            Open Conversations from the dealership menu to view live threads for this rooftop.
          </p>
        )}

        {tab === 'CRM' && (
          <div className="space-y-2 text-sm">
            <p>
              CRM Status: <StatusBadge status={dealership.crmStatus} />
            </p>
            <p className="text-[var(--text-secondary)]">
              CRM connection status for this dealership.
            </p>
          </div>
        )}

        {tab === 'Social Accounts' && (
          <div className="space-y-2 text-sm">
            <p>
              Social Status: <StatusBadge status={dealership.socialStatus} />
            </p>
            <p className="text-[var(--text-secondary)]">
              Facebook, Instagram, and WhatsApp are available for connection in
              Social Integrations.
            </p>
          </div>
        )}

        {tab === 'Settings' && (
          <p className="text-sm text-[var(--text-secondary)]">
            Dealership timezone is {dealership.timezone}. Status is {dealership.status}.
            Brand and inventory preferences are managed in Dealership Settings.
          </p>
        )}

        {tab === 'Reports' && (
          <p className="text-sm text-[var(--text-secondary)]">
            Conversion is currently {formatPercent(dealership.conversionRate)} with{' '}
            {formatNumber(dealership.closedDeals)} closed deals.
          </p>
        )}
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  )
}

function ItemList({ items, empty }) {
  if (!items.length) {
    return <p className="text-sm text-[var(--text-secondary)]">{empty}</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
        >
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-[var(--text-secondary)]">{item.meta}</p>
        </li>
      ))}
    </ul>
  )
}
