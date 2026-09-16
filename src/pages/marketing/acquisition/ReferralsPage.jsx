import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../hooks/useToast'
import { formatNumber } from '../../../utils/table'
import { REFERRAL_STATUSES } from '../../../data/referrals'
import {
  getEligibleReferrals,
  getReferrals,
  askForReferral,
} from '../../../services/api/marketingReferralService'

const DEFAULT_MESSAGE = 'Do you know someone who may be looking for a vehicle?'
const PAGE_SIZE = 8

export default function ReferralsPage() {
  const { showToast } = useToast()
  const [stats, setStats] = useState({
    referralRequests: 0,
    referralLeads: 0,
    qualifiedReferrals: 0,
    appointments: 0,
    soldReferrals: 0,
  })
  const [eligible, setEligible] = useState([])
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [eligibleLoading, setEligibleLoading] = useState(true)
  const [trackingLoading, setTrackingLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [saving, setSaving] = useState(false)

  const loadEligible = useCallback(async () => {
    setEligibleLoading(true)
    try {
      setEligible(await getEligibleReferrals())
    } catch (err) {
      setEligible([])
      showToast(err.message || 'Unable to load eligible customers.', 'error')
    } finally {
      setEligibleLoading(false)
    }
  }, [showToast])

  const loadTracking = useCallback(async () => {
    setTrackingLoading(true)
    try {
      const result = await getReferrals({ page, limit: PAGE_SIZE })
      setStats(result.stats)
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load referrals.', 'error')
    } finally {
      setTrackingLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void loadEligible(), 0)
    return () => window.clearTimeout(t)
  }, [loadEligible])

  useEffect(() => {
    const t = window.setTimeout(() => void loadTracking(), 0)
    return () => window.clearTimeout(t)
  }, [loadTracking])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.referrer.toLowerCase().includes(q) ||
          r.referredPerson.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q),
      )
    }
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [rows, search, status])

  const openAsk = (customer) => {
    setSelected(customer)
    setMessage(DEFAULT_MESSAGE)
    setModalOpen(true)
  }

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      await askForReferral({
        eligibleId: selected.id,
        message,
      })
      setModalOpen(false)
      showToast('Referral request created.')
      await Promise.all([loadEligible(), loadTracking()])
    } catch (err) {
      showToast(err.message || 'Unable to send referral request.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Referrals"
        description="Ask happy customers for referrals and track conversion."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Requests" value={formatNumber(stats.referralRequests)} />
        <StatCard label="Referral Leads" value={formatNumber(stats.referralLeads)} />
        <StatCard label="Qualified" value={formatNumber(stats.qualifiedReferrals)} />
        <StatCard label="Appointments" value={formatNumber(stats.appointments)} />
        <StatCard label="Sold" value={formatNumber(stats.soldReferrals)} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Eligible Customers</h2>
        {eligibleLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Button size="sm" onClick={() => openAsk(row)}>
                    Ask for Referral
                  </Button>
                ),
              },
            ]}
            rows={eligible}
            pageSize={5}
            emptyTitle="No eligible customers."
          />
        )}
      </Card>

      <Card className="mt-5">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search referrals..."
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...REFERRAL_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        <h2 className="mb-3 text-base font-semibold">Referral Tracking</h2>
        {trackingLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'referrer', label: 'Referrer' },
              { key: 'referredPerson', label: 'Referred Person' },
              { key: 'source', label: 'Source' },
              { key: 'date', label: 'Date' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'lead', label: 'Lead' },
              { key: 'appointment', label: 'Appointment' },
              { key: 'sale', label: 'Sale' },
            ]}
            rows={filtered}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No referrals found."
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Ask for Referral"
        className="max-w-lg"
      >
        <form className="grid gap-3" onSubmit={submitRequest}>
          <p className="text-sm text-[var(--text-secondary)]">
            Requesting referral from{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {selected?.customerName}
            </span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Message</label>
            <textarea
              className="input-field min-h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size={16} /> : 'Send Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
