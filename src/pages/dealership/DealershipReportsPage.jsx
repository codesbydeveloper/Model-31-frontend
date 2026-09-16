import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber, formatPercent } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import dealershipReportService from '../../services/api/dealershipReportService'

export default function DealershipReportsPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await dealershipReportService.getDealershipReportSummary())
    } catch (err) {
      setData(null)
      showToast(err.message || 'Unable to load reports.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumbs />
        <PageHeader title="Reports" description="Performance summary for this dealership." />
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
        <StatCard label="Conversion Rate" value={formatPercent(data.conversionRate)} />
      </div>
    </div>
  )
}
