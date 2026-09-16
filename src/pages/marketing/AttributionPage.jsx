import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import PipelineBadge from '../../components/common/PipelineBadge'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import {
  getAttributionStats,
  getAttributionFunnel,
  getAttributionJourney,
  getAttributionBreakdown,
} from '../../services/api/marketingAttributionService'

const PAGE_SIZE = 10
const EMPTY_PIPELINE_STATS = {
  label: '',
  leads: 0,
  qualified: 0,
  appointments: 0,
  sold: 0,
}

function formatConversion(rate) {
  return `${Number(rate).toFixed(1)}%`
}

function pipelineLabel(value) {
  if (!value || value === 'ALL') return 'All pipelines'
  return value
}

export default function AttributionPage() {
  const { showToast } = useToast()
  const [model31, setModel31] = useState({
    ...EMPTY_PIPELINE_STATS,
    label: 'MODEL 31',
  })
  const [dealership, setDealership] = useState({
    ...EMPTY_PIPELINE_STATS,
    label: 'DEALERSHIP',
  })
  const [funnel, setFunnel] = useState([])
  const [journey, setJourney] = useState([])
  const [rows, setRows] = useState([])
  const [pipelines, setPipelines] = useState(['ALL', 'MODEL 31', 'DEALERSHIP'])
  const [pipeline, setPipeline] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const [stats, funnelSteps, journeySteps] = await Promise.all([
        getAttributionStats(),
        getAttributionFunnel(),
        getAttributionJourney(),
      ])
      setModel31(stats.model31)
      setDealership(stats.dealership)
      setFunnel(funnelSteps)
      setJourney(journeySteps)
    } catch (err) {
      setModel31({ ...EMPTY_PIPELINE_STATS, label: 'MODEL 31' })
      setDealership({ ...EMPTY_PIPELINE_STATS, label: 'DEALERSHIP' })
      setFunnel([])
      setJourney([])
      showToast(err.message || 'Unable to load attribution.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadBreakdown = useCallback(async () => {
    setTableLoading(true)
    try {
      const result = await getAttributionBreakdown({
        page,
        limit: PAGE_SIZE,
        pipeline,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.pipelines?.length) setPipelines(result.pipelines)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load attribution breakdown.', 'error')
    } finally {
      setTableLoading(false)
    }
  }, [page, pipeline, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void loadSummary(), 0)
    return () => window.clearTimeout(t)
  }, [loadSummary])

  useEffect(() => {
    const t = window.setTimeout(() => void loadBreakdown(), 0)
    return () => window.clearTimeout(t)
  }, [loadBreakdown])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Marketing Attribution"
        description="Track how marketing content and campaigns convert into leads, appointments and sales."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-base font-semibold">{model31.label} Attribution</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Leads" value={formatNumber(model31.leads)} />
                <StatCard label="Qualified" value={formatNumber(model31.qualified)} />
                <StatCard label="Appointments" value={formatNumber(model31.appointments)} />
                <StatCard label="Sold" value={formatNumber(model31.sold)} />
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 text-base font-semibold">{dealership.label} Attribution</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Leads" value={formatNumber(dealership.leads)} />
                <StatCard label="Qualified" value={formatNumber(dealership.qualified)} />
                <StatCard label="Appointments" value={formatNumber(dealership.appointments)} />
                <StatCard label="Sold" value={formatNumber(dealership.sold)} />
              </div>
            </Card>
          </div>

          <Card className="mb-5">
            <h2 className="mb-4 text-base font-semibold">Attribution Funnel</h2>
            <div className="flex flex-col items-stretch gap-2">
              {funnel.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className="w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{step.label}</p>
                    <p className="text-xl font-semibold">{formatNumber(step.value)}</p>
                    {step.conversionRate != null && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Conversion from {step.from || 'previous'}: {formatConversion(step.conversionRate)}
                      </p>
                    )}
                  </div>
                  {index < funnel.length - 1 && (
                    <div className="my-1 text-[var(--text-muted)]">↓</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="mb-5">
            <h2 className="mb-4 text-base font-semibold">Attribution Journey</h2>
            <div className="flex flex-col items-center gap-1">
              {journey.map((step, index) => (
                <div key={step.stage} className="flex w-full max-w-xl flex-col items-center">
                  <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{step.stage}</p>
                    <p className="text-lg font-semibold">
                      {step.isCurrency
                        ? `$${formatNumber(step.count)}`
                        : formatNumber(step.count)}
                    </p>
                  </div>
                  {index < journey.length - 1 && (
                    <div className="text-[var(--text-muted)]">↓</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Attribution Breakdown</h2>
          <Select
            value={pipeline}
            onChange={(e) => {
              setPipeline(e.target.value)
              setPage(1)
            }}
            options={pipelines.map((item) => ({
              value: item,
              label: pipelineLabel(item),
            }))}
          />
        </div>
        {tableLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'leadSource', label: 'Source' },
              {
                key: 'pipeline',
                label: 'Pipeline',
                render: (row) => <PipelineBadge pipelineType={row.pipeline} />,
              },
              { key: 'campaign', label: 'Campaign' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              { key: 'content', label: 'Content' },
              {
                key: 'leads',
                label: 'Lead',
                render: (row) => formatNumber(row.leads),
              },
              {
                key: 'qualifiedLeads',
                label: 'Qualified',
                render: (row) => formatNumber(row.qualifiedLeads),
              },
              {
                key: 'appointments',
                label: 'Appointment',
                render: (row) => formatNumber(row.appointments),
              },
              {
                key: 'soldDeals',
                label: 'Sold',
                render: (row) => formatNumber(row.soldDeals),
              },
              {
                key: 'revenue',
                label: 'Revenue',
                render: (row) => `$${formatNumber(row.revenue)}`,
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No attribution rows found."
          />
        )}
      </Card>
    </div>
  )
}
