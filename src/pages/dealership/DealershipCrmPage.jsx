import { useCallback, useEffect, useRef, useState } from 'react'
import { Car, Download, FileSpreadsheet, Receipt, Upload, Users, X } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import dealershipCrmService from '../../services/api/dealershipCrmService'
import {
  formatMoney,
  getInventoryManagerInventoryPage,
} from '../../services/api/inventoryManagerService'

const CHARGE_PAGE_SIZE = 10

function ColumnGroup({ label, fields }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {fields.map((field) => (
          <span
            key={field}
            className="rounded-md border border-[var(--border-default)] bg-white px-2.5 py-1 font-mono text-xs text-[var(--text-primary)]"
          >
            {field}
          </span>
        ))}
      </div>
    </div>
  )
}

function isCsvFile(file) {
  if (!file) return false
  const name = String(file.name || '').toLowerCase()
  const type = String(file.type || '').toLowerCase()
  return name.endsWith('.csv') || type.includes('csv')
}

function CsvUploadModal({ open, title, hint, uploading, onClose, onUpload }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) return undefined
    const timer = window.setTimeout(() => {
      setFile(null)
      setDragOver(false)
      setError('')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open])

  const chooseFile = (next) => {
    if (!next) return
    if (!isCsvFile(next)) {
      setFile(null)
      setError('Choose a CSV file.')
      return
    }
    setError('')
    setFile(next)
  }

  return (
    <Modal open={open} onClose={uploading ? undefined : onClose} title={title}>
      <p className="text-sm text-[var(--text-secondary)]">{hint}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!uploading) inputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (uploading) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          if (uploading) return
          chooseFile(event.dataTransfer.files?.[0])
        }}
        className={`mt-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-4 py-8 text-center transition ${
          dragOver
            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
            : 'border-[var(--border-strong)] bg-[var(--bg-app)]'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--brand-accent)]">
          <FileSpreadsheet size={20} />
        </span>
        <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">
          Drop the CSV here
        </span>
        <span className="mt-1 text-xs text-[var(--text-muted)]">or choose it from this computer</span>
        <Button
          variant="secondary"
          className="mt-4"
          disabled={uploading}
          onClick={(event) => {
            event.stopPropagation()
            inputRef.current?.click()
          }}
        >
          Choose from computer
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          chooseFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white px-3 py-2">
          <FileSpreadsheet size={16} className="shrink-0 text-[var(--brand-accent)]" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
            {file.name}
          </p>
          <button
            type="button"
            aria-label="Remove file"
            disabled={uploading}
            onClick={() => {
              setFile(null)
              setError('')
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm text-[var(--status-error)]">{error}</p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" disabled={uploading} onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!file || uploading} onClick={() => onUpload(file)}>
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </Modal>
  )
}

function UploadCard({
  icon: Icon,
  title,
  summary,
  count,
  countLabel,
  required,
  optional,
  buttonLabel,
  busy,
  sampleBusy,
  disabled,
  onUpload,
  onSample,
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">{summary}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <div className="min-w-[4.5rem] text-right">
            <p className="text-2xl font-semibold leading-none tracking-tight text-[var(--text-primary)]">
              {count}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{countLabel}</p>
          </div>
          <Button disabled={disabled} onClick={onUpload}>
            <Upload size={16} />
            {busy ? 'Uploading...' : buttonLabel}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-[var(--border-default)] bg-[var(--bg-app)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          {optional?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColumnGroup label="Required columns" fields={required} />
              <ColumnGroup label="Optional columns" fields={optional} />
            </div>
          ) : (
            <ColumnGroup label="Required columns" fields={required} />
          )}
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            CSV file. The header row must use these column names.
          </p>
        </div>
        <Button variant="secondary" className="shrink-0 self-end sm:self-center" disabled={disabled} onClick={onSample}>
          <Download size={16} />
          {sampleBusy ? 'Downloading...' : 'Sample CSV'}
        </Button>
      </div>
    </Card>
  )
}

export default function DealershipCrmPage() {
  const { showToast } = useToast()
  const [total, setTotal] = useState(0)
  const [cars, setCars] = useState(0)
  const [charges, setCharges] = useState([])
  const [chargeTotal, setChargeTotal] = useState(0)
  const [chargePage, setChargePage] = useState(1)
  const [chargesLoading, setChargesLoading] = useState(true)
  const [chargesError, setChargesError] = useState('')
  const [uploading, setUploading] = useState('')
  const [uploadTarget, setUploadTarget] = useState('')

  const loadCounts = useCallback(async () => {
    try {
      const [leadResult, inventoryResult] = await Promise.all([
        dealershipCrmService.getBdcLeads({ page: 1, limit: 1 }),
        getInventoryManagerInventoryPage({ page: 1, limit: 1 }),
      ])
      setTotal(leadResult.total)
      setCars(inventoryResult.total)
    } catch (err) {
      showToast(err.message || 'Unable to load counts.', 'error')
    }
  }, [showToast])

  const loadCharges = useCallback(async () => {
    setChargesLoading(true)
    try {
      const result = await dealershipCrmService.getBdcSoldCharges({
        page: chargePage,
        limit: CHARGE_PAGE_SIZE,
      })
      setCharges(result.items)
      setChargeTotal(result.total)
      setChargesError('')
      if (result.items.length === 0 && chargePage > 1) {
        setChargePage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setCharges([])
      setChargeTotal(0)
      setChargesError(err.message || 'Unable to load the $31 charges.')
    } finally {
      setChargesLoading(false)
    }
  }, [chargePage])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCounts()
      void loadCharges()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadCounts, loadCharges])

  const downloadLeadsSample = async () => {
    setUploading('leads-sample')
    try {
      await dealershipCrmService.downloadBdcLeadsSample()
      showToast('Sample CSV downloaded.')
    } catch (err) {
      showToast(err.message || 'Unable to download the sample.', 'error')
    } finally {
      setUploading('')
    }
  }

  const downloadInventorySample = async () => {
    setUploading('inventory-sample')
    try {
      await dealershipCrmService.downloadBdcInventorySample()
      showToast('Sample CSV downloaded.')
    } catch (err) {
      showToast(err.message || 'Unable to download the sample.', 'error')
    } finally {
      setUploading('')
    }
  }

  const uploadLeads = async (file) => {
    if (!file) return
    setUploading('leads')
    try {
      const message = await dealershipCrmService.uploadBdcLeads(file)
      showToast(message)
      setUploadTarget('')
      await loadCounts()
    } catch (err) {
      showToast(err.message || 'Unable to upload leads.', 'error')
    } finally {
      setUploading('')
    }
  }

  const uploadInventory = async (file) => {
    if (!file) return
    setUploading('inventory')
    try {
      const message = await dealershipCrmService.uploadBdcInventory(file)
      showToast(message)
      setUploadTarget('')
      await loadCounts()
    } catch (err) {
      showToast(err.message || 'Unable to upload inventory.', 'error')
    } finally {
      setUploading('')
    }
  }

  const downloadSoldSample = async () => {
    setUploading('sold-sample')
    try {
      await dealershipCrmService.downloadBdcSoldSample()
      showToast('Sample CSV downloaded.')
    } catch (err) {
      showToast(err.message || 'Unable to download the sample.', 'error')
    } finally {
      setUploading('')
    }
  }

  const uploadSold = async (file) => {
    if (!file) return
    setUploading('sold')
    try {
      const message = await dealershipCrmService.uploadBdcSold(file)
      showToast(message)
      setUploadTarget('')
      if (chargePage !== 1) setChargePage(1)
      else await loadCharges()
    } catch (err) {
      showToast(err.message || 'Unable to upload the sold file.', 'error')
    } finally {
      setUploading('')
    }
  }

  const closeUpload = () => {
    if (uploading === 'leads' || uploading === 'inventory' || uploading === 'sold') return
    setUploadTarget('')
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs />
      <PageHeader
        title="BDC Lead Manager"
        description="Upload the leads, inventory, and sold files from the dealership’s own system. No CRM connection."
      />

      <div className="grid gap-5">
        <UploadCard
          icon={Users}
          title="Leads"
          summary="Buyer list from the dealership’s own system. New leads show on the Leads page."
          count={total}
          countLabel={total === 1 ? 'lead uploaded' : 'leads uploaded'}
          required={['name', 'phone', 'vehicle_interest']}
          optional={['email', 'trade_in']}
          buttonLabel="Upload Leads"
          busy={uploading === 'leads'}
          sampleBusy={uploading === 'leads-sample'}
          disabled={Boolean(uploading)}
          onUpload={() => setUploadTarget('leads')}
          onSample={() => void downloadLeadsSample()}
        />
        <UploadCard
          icon={Car}
          title="Inventory"
          summary="Cars currently on the lot. Uploaded vehicles show on the Inventory page."
          count={cars}
          countLabel={cars === 1 ? 'car in stock' : 'cars in stock'}
          required={['vin', 'year', 'make', 'model', 'price']}
          optional={['trim', 'mileage', 'color', 'stock_number']}
          buttonLabel="Upload Inventory"
          busy={uploading === 'inventory'}
          sampleBusy={uploading === 'inventory-sample'}
          disabled={Boolean(uploading)}
          onUpload={() => setUploadTarget('inventory')}
          onSample={() => void downloadInventorySample()}
        />
        <UploadCard
          icon={Receipt}
          title="Sold file"
          summary="Cars sold that day. A buyer phone that matches a lead the AI already talked to adds $31."
          count={chargeTotal}
          countLabel={chargeTotal === 1 ? '$31 charge' : '$31 charges'}
          required={['buyer_name', 'buyer_phone', 'vin', 'sold_date']}
          buttonLabel="Upload Sold File"
          busy={uploading === 'sold'}
          sampleBusy={uploading === 'sold-sample'}
          disabled={Boolean(uploading)}
          onUpload={() => setUploadTarget('sold')}
          onSample={() => void downloadSoldSample()}
        />
      </div>

      <Card className="mt-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">$31 charges</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Matches from the sold file. This list is view only.
        </p>
        <div className="mt-4">
          {chargesLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : chargesError ? (
            <p className="text-sm text-[var(--status-error)]">{chargesError}</p>
          ) : (
            <DataTable
              rows={charges}
              rowKey="id"
              page={chargePage}
              pageSize={CHARGE_PAGE_SIZE}
              totalItems={chargeTotal}
              onPageChange={setChargePage}
              showPagination={chargeTotal > CHARGE_PAGE_SIZE}
              emptyTitle="No $31 charges yet."
              emptyDescription="Matched sold cars will appear here after the sold file is uploaded."
              columns={[
                { key: 'buyerName', label: 'Buyer', className: 'text-center', cellClassName: 'text-center' },
                { key: 'buyerPhone', label: 'Phone', className: 'text-center', cellClassName: 'text-center' },
                { key: 'vin', label: 'VIN', className: 'text-center', cellClassName: 'text-center' },
                { key: 'soldDate', label: 'Sold date', className: 'text-center', cellClassName: 'text-center' },
                {
                  key: 'amount',
                  label: 'Amount',
                  className: 'text-center',
                  cellClassName: 'text-center',
                  render: (row) => formatMoney(row.amount),
                },
              ]}
            />
          )}
        </div>
      </Card>

      <CsvUploadModal
        open={uploadTarget === 'leads'}
        title="Upload Leads"
        hint="Drop the leads CSV here, or choose the file from this computer. It is sent when you click Upload."
        uploading={uploading === 'leads'}
        onClose={closeUpload}
        onUpload={(file) => void uploadLeads(file)}
      />
      <CsvUploadModal
        open={uploadTarget === 'inventory'}
        title="Upload Inventory"
        hint="Drop the inventory CSV here, or choose the file from this computer. It is sent when you click Upload."
        uploading={uploading === 'inventory'}
        onClose={closeUpload}
        onUpload={(file) => void uploadInventory(file)}
      />
      <CsvUploadModal
        open={uploadTarget === 'sold'}
        title="Upload Sold File"
        hint="Drop the sold CSV here, or choose the file from this computer. It is sent when you click Upload."
        uploading={uploading === 'sold'}
        onClose={closeUpload}
        onUpload={(file) => void uploadSold(file)}
      />
    </div>
  )
}
