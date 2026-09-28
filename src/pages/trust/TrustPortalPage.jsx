import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../data/roles'
import { getDealerships } from '../../services/api/dealershipService'
import { getTrustInvoices, runAttribution, uploadSoldLog } from '../../services/api/trustPortalService'

const PAGE_SIZE = 20

function thisMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const EMPTY_UNIT = {
  saleId: '',
  vin: '',
  stockNumber: '',
  saleDate: '',
  phone: '',
  email: '',
  customerName: '',
}

export default function TrustPortalPage({ invoiceBase }) {
  const { showToast } = useToast()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
  const [dealerships, setDealerships] = useState([])
  const [dealershipId, setDealershipId] = useState('')
  const [unit, setUnit] = useState(EMPTY_UNIT)
  const [units, setUnits] = useState([])
  const [month, setMonth] = useState(thisMonth)
  const [saving, setSaving] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadInvoices = useCallback(async (nextPage = 1) => {
    setLoading(true)
    try {
      const result = await getTrustInvoices({ page: nextPage, limit: PAGE_SIZE })
      setInvoices(result.items)
      setPage(result.page)
      setTotal(result.total)
    } catch (err) {
      setInvoices([])
      setTotal(0)
      showToast(err.message || 'Unable to load invoices.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInvoices(1)
      if (!isSuperAdmin) return
      getDealerships({ page: 1, limit: 100 })
        .then((result) => setDealerships(result.items || []))
        .catch(() => setDealerships([]))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isSuperAdmin, loadInvoices])

  const addUnit = () => {
    if (!unit.saleId.trim() || !unit.saleDate) {
      showToast('Each sold car needs a sale ID and a sale date.', 'error')
      return
    }
    setUnits((current) => [...current, { ...unit, saleId: unit.saleId.trim() }])
    setUnit(EMPTY_UNIT)
  }

  const submitLog = async () => {
    const ready = [...units]
    if (unit.saleId.trim() || unit.saleDate) {
      if (!unit.saleId.trim() || !unit.saleDate) {
        showToast('Each sold car needs a sale ID and a sale date.', 'error')
        return
      }
      ready.push({ ...unit, saleId: unit.saleId.trim() })
    }
    if (!ready.length) {
      showToast('Add at least one sold car.', 'error')
      return
    }
    if (isSuperAdmin && !dealershipId) {
      showToast('Choose the dealership this sold log belongs to.', 'error')
      return
    }

    setSaving(true)
    try {
      await uploadSoldLog({
        dealershipId: isSuperAdmin ? dealershipId : '',
        units: ready,
      })
      setUnits([])
      setUnit(EMPTY_UNIT)
      showToast('Sold log accepted. Attribution runs with the upload.')
      await loadInvoices(1)
    } catch (err) {
      showToast(err.message || 'Unable to upload the sold log.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const refreshMonth = async () => {
    if (!month) {
      showToast('Choose a month, like 2026-09.', 'error')
      return
    }
    if (isSuperAdmin && !dealershipId) {
      showToast('Choose a dealership before refreshing attribution.', 'error')
      return
    }
    setSaving(true)
    try {
      await runAttribution({
        dealershipId: isSuperAdmin ? dealershipId : '',
        month,
      })
      showToast('Attribution refreshed.')
      await loadInvoices(page)
    } catch (err) {
      showToast(err.message || 'Unable to refresh attribution.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader title="Trust Portal" />

      <Card className="mb-4">
        <h2 className="text-base font-semibold">Upload sold cars</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {isSuperAdmin
            ? 'Pick the store, then add the sold cars. Matching uses phone plus email first, then phone plus last name, then a similar name.'
            : 'This upload is for your store only. The server uses the dealership on your login. You do not type a store id.'}
        </p>

        {isSuperAdmin ? (
          <div className="mt-4 max-w-md">
            <Select
              label="Dealership"
              value={dealershipId}
              onChange={(event) => setDealershipId(event.target.value)}
              placeholder="Choose a dealership"
              options={dealerships.map((store) => ({
                value: store.id,
                label: store.name || store.id,
              }))}
            />
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Sale ID" value={unit.saleId} onChange={(event) => setUnit({ ...unit, saleId: event.target.value })} />
          <Input label="Sale date" type="date" value={unit.saleDate} onChange={(event) => setUnit({ ...unit, saleDate: event.target.value })} />
          <Input label="VIN" value={unit.vin} onChange={(event) => setUnit({ ...unit, vin: event.target.value })} />
          <Input label="Stock number" value={unit.stockNumber} onChange={(event) => setUnit({ ...unit, stockNumber: event.target.value })} />
          <Input label="Phone" value={unit.phone} onChange={(event) => setUnit({ ...unit, phone: event.target.value })} />
          <Input label="Email" value={unit.email} onChange={(event) => setUnit({ ...unit, email: event.target.value })} />
          <Input label="Customer name" value={unit.customerName} onChange={(event) => setUnit({ ...unit, customerName: event.target.value })} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={addUnit} disabled={saving}>
            Add to list
          </Button>
          <Button onClick={submitLog} disabled={saving}>
            {saving ? <LoadingSpinner size={16} /> : 'Upload sold log'}
          </Button>
        </div>
        {units.length ? (
          <ul className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
            {units.map((item) => (
              <li key={`${item.saleId}-${item.saleDate}`}>
                {item.saleId} · {item.saleDate} · {item.stockNumber || 'no stock'} · {item.customerName || 'no name'}
                <button
                  type="button"
                  className="ml-2 text-[var(--status-error)]"
                  onClick={() => setUnits((current) => current.filter((row) => row !== item))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      {isSuperAdmin ? (
        <Card className="mb-4">
          <h2 className="text-base font-semibold">Refresh a month</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            The upload already runs attribution. Use this only when you want to recalculate a month.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              containerClassName="sm:max-w-xs"
            />
            <Button variant="secondary" onClick={refreshMonth} disabled={saving}>
              Refresh attribution
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-4 text-base font-semibold">Invoices</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Invoice',
                render: (row) => (
                  <Link
                    to={`${invoiceBase}/${encodeURIComponent(row.id || row._id || row.invoiceId || row._key)}`}
                    className="font-medium text-[var(--brand-accent)] hover:underline"
                  >
                    {row.id || row._id || row.invoiceId || row._key}
                  </Link>
                ),
              },
              { key: 'periodMonth', label: 'Month', render: (row) => row.periodMonth || row.month || row.period || '—' },
              { key: 'dealership', label: 'Dealership', render: (row) => row.dealershipName || row.dealership || row.dealershipId || '—' },
              { key: 'influencedSales', label: 'Influenced sales', render: (row) => row.influencedSales ?? row.totalInfluenced ?? row.influencedCount ?? '—' },
              {
                key: 'amountDue',
                label: 'Amount due',
                render: (row) => {
                  const amount = row.amountDue ?? row.totalAmount ?? row.amount
                  if (amount === '' || amount == null) return '—'
                  const text = String(amount)
                  return text.startsWith('$') ? text : `$${text}`
                },
              },
              { key: 'status', label: 'Status', render: (row) => row.status || '—' },
            ]}
            rows={invoices}
            rowKey="_key"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={total}
            showPagination
            onPageChange={(next) => void loadInvoices(next)}
            emptyTitle="No invoices yet"
            emptyDescription="Upload a sold log to create the $31 proof."
          />
        )}
      </Card>
    </div>
  )
}
