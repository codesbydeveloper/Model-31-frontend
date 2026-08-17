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
import referralService from '../../../services/mock/referralService'

const DEFAULT_MESSAGE = 'Do you know someone who may be looking for a vehicle?'

export default function ReferralsPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await referralService.getReferrals())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.rows
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
  }, [data, search, status])

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
      await referralService.createReferralRequest({
        customerName: selected.customerName,
        message,
      })
      setModalOpen(false)
      showToast('Referral request created.')
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const { stats, eligible } = data

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
          pageSize={8}
          onPageChange={setPage}
          emptyTitle="No referrals found."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
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
