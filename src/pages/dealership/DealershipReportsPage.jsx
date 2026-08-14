import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber, formatPercent } from '../../utils/table'
import platformAnalyticsService from '../../services/mock/platformAnalyticsService'

export default function DealershipReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const analytics = await platformAnalyticsService.getPlatformAnalytics()
      const miami = analytics.dealerships.find(
        (d) => d.dealership === 'Miami Luxury Motors',
      )
      setData(miami || analytics.dealerships[0])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

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
        title="Reports"
        description={`Performance summary for ${data.dealership}.`}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Leads" value={formatNumber(data.leads)} />
        <StatCard label="Qualified" value={formatNumber(data.qualified)} />
        <StatCard label="Appointments" value={formatNumber(data.appointments)} />
        <StatCard label="Sold" value={formatNumber(data.sold)} />
        <StatCard label="Revenue" value={`$${formatNumber(data.revenue)}`} />
        <StatCard
          label="Conversion Rate"
          value={formatPercent(data.conversionRate)}
        />
      </div>
      <Card className="mt-5">
        <p className="text-sm text-[var(--text-secondary)]">
          Detailed reporting remains mock/frontend-only. Connect live analytics APIs
          in a later backend step.
        </p>
      </Card>
    </div>
  )
}
