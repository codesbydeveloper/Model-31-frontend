import { useCallback, useEffect, useState } from 'react'
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
import { useToast } from '../../hooks/useToast'
import {
  EMPTY_PIPELINE_PAGE,
  getPipelineTransparency,
} from '../../services/api/superAdminPipelineTransparencyService'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

export default function PipelineTransparencyPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(EMPTY_PIPELINE_PAGE)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pipeline, setPipeline] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPipelineTransparency({
        search: debouncedSearch,
        pipeline,
        source,
        status,
        page,
        limit: PAGE_SIZE,
      })
      setData(result)
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setData(EMPTY_PIPELINE_PAGE)
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load pipeline transparency.', 'error')
    } finally {
      setInitialized(true)
      setLoading(false)
    }
  }, [debouncedSearch, pipeline, source, status, page, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const onFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  if (loading && !initialized) {
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
        title={data.pageTitle}
        description={data.description}
      />
      {data.enforcementNote ? (
        <p className="mb-4 -mt-2 text-sm text-[var(--text-secondary)]">{data.enforcementNote}</p>
      ) : null}

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
        <FlowCard title={data.staffFlow.title} steps={data.staffFlow.steps} />
        <FlowCard title={data.dealershipFlow.title} steps={data.dealershipFlow.steps} />
      </div>

      <Card className="mt-4">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lead ID, customer, email..."
          />
          <Select
            value={pipeline}
            onChange={onFilterChange(setPipeline)}
            options={data.options.pipelines}
          />
          <Select
            value={source}
            onChange={onFilterChange(setSource)}
            options={data.options.sources}
          />
          <Select
            value={status}
            onChange={onFilterChange(setStatus)}
            options={data.options.statuses}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Lead ID',
                render: (row) => (
                  <Link
                    to={`/super-admin/pipeline-transparency/${encodeURIComponent(row.id)}`}
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
                render: (row) => <StatusBadge status={row.model31_signature} />,
              },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No leads match these filters."
          />
        )}
      </Card>
    </div>
  )
}

function FlowCard({ title, steps }) {
  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {steps.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No flow data yet.</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {steps.map((item, index) => (
            <li key={`${item.step}-${index}`}>
              <p className="font-medium">
                {index + 1}. {item.step}
              </p>
              {item.detail ? (
                <p className="text-[var(--text-secondary)]">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
