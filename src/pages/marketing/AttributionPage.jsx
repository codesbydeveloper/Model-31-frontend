import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { formatNumber } from '../../utils/table'
import attributionService from '../../services/mock/attributionService'
import platformAnalyticsService from '../../services/mock/platformAnalyticsService'

function pct(part, whole) {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
}

export default function AttributionPage() {
  const [funnel, setFunnel] = useState(null)
  const [rows, setRows] = useState([])
  const [journey, setJourney] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, analytics] = await Promise.all([
        attributionService.getAttributionData(),
        platformAnalyticsService.getPlatformAnalytics(),
      ])
      setFunnel(data.funnel)
      setRows(data.rows)
      setJourney(analytics.journey || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading || !funnel) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const steps = [
    { key: 'impressions', label: 'Impressions', value: funnel.impressions },
    { key: 'clicks', label: 'Clicks', value: funnel.clicks },
    { key: 'leads', label: 'Leads', value: funnel.leads },
    { key: 'qualified', label: 'Qualified', value: funnel.qualified },
    { key: 'appointments', label: 'Appointments', value: funnel.appointments },
    { key: 'sold', label: 'Sold', value: funnel.sold },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Marketing Attribution"
        description="Track how marketing content and campaigns convert into leads, appointments and sales."
      />

      <Card className="mb-5">
        <h2 className="mb-4 text-base font-semibold">Attribution Funnel</h2>
        <div className="flex flex-col items-stretch gap-2">
          {steps.map((step, index) => {
            const prev = index === 0 ? null : steps[index - 1]
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className="w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-3 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">{step.label}</p>
                  <p className="text-xl font-semibold">{formatNumber(step.value)}</p>
                  {prev && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Conversion from {prev.label}: {pct(step.value, prev.value)}
                    </p>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="my-1 text-[var(--text-muted)]">↓</div>
                )}
              </div>
            )
          })}
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

      <Card>
        <h2 className="mb-4 text-base font-semibold">Attribution Breakdown</h2>
        <DataTable
          columns={[
            { key: 'leadSource', label: 'Source' },
            { key: 'campaign', label: 'Campaign' },
            {
              key: 'platform',
              label: 'Platform',
              render: (row) => <PlatformBadge platform={row.platform} />,
            },
            { key: 'content', label: 'Content' },
            { key: 'leads', label: 'Lead' },
            { key: 'qualifiedLeads', label: 'Qualified' },
            { key: 'appointments', label: 'Appointment' },
            { key: 'soldDeals', label: 'Sold' },
            {
              key: 'revenue',
              label: 'Revenue',
              render: (row) => `$${formatNumber(row.revenue)}`,
            },
          ]}
          rows={rows}
          pageSize={10}
        />
      </Card>
    </div>
  )
}
