import { useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { useToast } from '../../hooks/useToast'

const LEADS_KEY = 'model31_bdc_leads'
const CARS_KEY = 'model31_bdc_inventory'

function readStored(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const source = String(text || '').replace(/^\uFEFF/, '')

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell.trim())
      cell = ''
    } else if (char === '\n') {
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell.trim())
    if (row.some(Boolean)) rows.push(row)
  }

  return rows
}

function headerKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function rowsFromCsv(text, required) {
  const table = parseCsv(text)
  if (table.length < 2) {
    throw new Error('The file needs a header row and at least one data row.')
  }
  const headers = table[0].map(headerKey)
  const missing = required.filter((key) => !headers.includes(key))
  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(', ')}.`)
  }
  return table.slice(1).map((cells) => {
    const record = {}
    headers.forEach((key, index) => {
      record[key] = cells[index] || ''
    })
    return record
  })
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read that file.'))
    reader.readAsText(file)
  })
}

export default function DealershipCrmPage() {
  const { showToast } = useToast()
  const leadsInput = useRef(null)
  const inventoryInput = useRef(null)
  const [leads, setLeads] = useState(() => readStored(LEADS_KEY))
  const [cars, setCars] = useState(() => readStored(CARS_KEY))
  const [uploading, setUploading] = useState('')

  useEffect(() => {
    sessionStorage.setItem(LEADS_KEY, JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    sessionStorage.setItem(CARS_KEY, JSON.stringify(cars))
  }, [cars])

  const uploadLeads = async (file) => {
    if (!file) return
    setUploading('leads')
    try {
      const records = rowsFromCsv(await readFile(file), ['name', 'phone', 'vehicle_interest'])
      const next = []
      const seen = new Set()
      records.forEach((record, index) => {
        const phone = record.phone.replace(/\s/g, '')
        const name = record.name.trim()
        if (!name || !phone || seen.has(phone)) return
        seen.add(phone)
        next.push({
          id: `lead_${phone}`,
          name,
          phone,
          vehicle: record.vehicle_interest.trim(),
          status: 'Open',
          order: index,
        })
      })
      if (!next.length) throw new Error('No leads were found in that file.')
      setLeads(next)
      showToast(`${next.length} lead${next.length === 1 ? '' : 's'} uploaded.`)
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
      const records = rowsFromCsv(await readFile(file), ['vin', 'year', 'make', 'model', 'price'])
      const next = []
      const seen = new Set()
      records.forEach((record) => {
        const vin = record.vin.trim().toUpperCase()
        if (!vin || seen.has(vin)) return
        seen.add(vin)
        next.push({
          vin,
          year: record.year.trim(),
          make: record.make.trim(),
          model: record.model.trim(),
          price: record.price.trim(),
        })
      })
      if (!next.length) throw new Error('No cars were found in that file.')
      setCars(next)
      showToast(`${next.length} car${next.length === 1 ? '' : 's'} uploaded.`)
    } catch (err) {
      showToast(err.message || 'Unable to upload inventory.', 'error')
    } finally {
      setUploading('')
    }
  }

  const markSold = (lead) => {
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, status: 'Sold' } : item)),
    )
    showToast(`${lead.name} marked sold.`)
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title="BDC Lead Manager"
        description="Upload the leads and inventory files from the dealership’s own system. No CRM connection."
      />

      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Upload files</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Leads need name, phone, and vehicle_interest. Inventory needs vin, year, make, model, and price.
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {leads.length} lead{leads.length === 1 ? '' : 's'} · {cars.length} car{cars.length === 1 ? '' : 's'} in stock
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={Boolean(uploading)} onClick={() => leadsInput.current?.click()}>
              {uploading === 'leads' ? 'Uploading...' : 'Upload Leads'}
            </Button>
            <Button
              variant="secondary"
              disabled={Boolean(uploading)}
              onClick={() => inventoryInput.current?.click()}
            >
              {uploading === 'inventory' ? 'Uploading...' : 'Upload Inventory'}
            </Button>
          </div>
        </div>
        <input
          ref={leadsInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void uploadLeads(file)
          }}
        />
        <input
          ref={inventoryInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void uploadInventory(file)
          }}
        />
      </Card>

      <DataTable
        rows={leads}
        rowKey="id"
        pageSize={10}
        showPagination={leads.length > 10}
        emptyTitle="No leads yet"
        emptyDescription="Upload a leads CSV to see customers here."
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'vehicle', label: 'Vehicle' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: 'sold',
            label: '',
            render: (row) =>
              row.status === 'Sold' ? null : (
                <Button size="sm" variant="secondary" onClick={() => markSold(row)}>
                  Mark Sold
                </Button>
              ),
          },
        ]}
      />
    </div>
  )
}
