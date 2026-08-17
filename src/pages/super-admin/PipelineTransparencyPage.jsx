import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import PipelineBadge from '../../components/common/PipelineBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import leadService from '../../services/mock/leadService'
import { PIPELINE_TYPES } from '../../utils/pipeline'
import { LEAD_SOURCES, LEAD_STATUSES } from '../../data/leads'
import { staffSocialLeadFlow, dealershipLeadFlow } from '../../data/socialAccounts'

export default function PipelineTransparencyPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pipeline, setPipeline] = useState('all')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await leadService.getPipelineTransparency())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    if (!data?.rows) return []
    const q = search.trim().toLowerCase()
    return data.rows.filter((row) => {
      if (pipeline !== 'all' && row.pipelineType !== pipeline) return false
      if (source !== 'all' && row.source !== source) return false
      if (status !== 'all' && row.status !== status) return false
      if (!q) return true
      return (
        row.id.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        String(row.email || '').toLowerCase().includes(q)
      )
    })
  }, [data, search, pipeline, source, status])

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Pipeline Transparency"
        description="Monitor the separation between Model 31 leads and dealership leads."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">MODEL 31 PIPELINE</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Total Leads" value={formatNumber(data.model31.total)} />
            <StatCard label="Active" value={formatNumber(data.model31.active)} />
            <StatCard label="Qualified" value={formatNumber(data.model31.qualified)} />
            <StatCard label="Appointments" value={formatNumber(data.model31.appointments)} />
            <StatCard label="Sold" value={formatNumber(data.model31.sold)} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">DEALERSHIP PIPELINE</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Total Leads" value={formatNumber(data.dealership.total)} />
            <StatCard label="Active" value={formatNumber(data.dealership.active)} />
            <StatCard label="Qualified" value={formatNumber(data.dealership.qualified)} />
            <StatCard label="Appointments" value={formatNumber(data.dealership.appointments)} />
            <StatCard label="Sold" value={formatNumber(data.dealership.sold)} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Staff Social Lead Mock Flow</h2>
          <ol className="space-y-2 text-sm">
            {staffSocialLeadFlow.map((item, index) => (
              <li key={item.step}>
                <p className="font-medium">
                  {index + 1}. {item.step}
                </p>
                <p className="text-[var(--text-secondary)]">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Dealership CRM Lead Mock Flow</h2>
          <ol className="space-y-2 text-sm">
            {dealershipLeadFlow.map((item, index) => (
              <li key={item.step}>
                <p className="font-medium">
                  {index + 1}. {item.step}
                </p>
                <p className="text-[var(--text-secondary)]">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search lead ID, customer, email..."
          />
          <Select
            value={pipeline}
            onChange={(e) => {
              setPipeline(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All pipelines' },
              { value: PIPELINE_TYPES.MODEL31, label: 'MODEL 31' },
              { value: PIPELINE_TYPES.DEALERSHIP, label: 'DEALERSHIP' },
            ]}
          />
          <Select
            value={source}
            onChange={(e) => {
              setSource(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All sources' },
              ...LEAD_SOURCES.map((item) => ({ value: item, label: item })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...LEAD_STATUSES.map((item) => ({ value: item, label: item })),
            ]}
          />
        </div>
        <DataTable
          columns={[
            {
              key: 'id',
              label: 'Lead ID',
              render: (row) => (
                <Link
                  to={`/super-admin/leads/${row.id}`}
                  className="font-medium text-[var(--brand-accent)] hover:underline"
                >
                  {row.id}
                </Link>
              ),
            },
            { key: 'customerName', label: 'Customer' },
            {
              key: 'pipelineType',
              label: 'Pipeline',
              render: (row) => <PipelineBadge pipelineType={row.pipelineType} />,
            },
            { key: 'source', label: 'Source' },
            { key: 'classificationStatus', label: 'Classification' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            { key: 'salesperson', label: 'Salesperson' },
            { key: 'createdLabel', label: 'Created' },
            {
              key: 'model31_signature',
              label: 'Model 31 Signature',
              render: (row) => (
                <StatusBadge
                  status={
                    row.pipelineType === PIPELINE_TYPES.MODEL31
                      ? '✓ VERIFIED'
                      : 'NOT APPLICABLE'
                  }
                />
              ),
            },
          ]}
          rows={filtered}
          page={page}
          onPageChange={setPage}
          pageSize={10}
          emptyTitle="No leads match these filters."
        />
      </Card>
    </div>
  )
}
