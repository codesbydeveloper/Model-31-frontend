import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import OEMReporting from '../../components/oem/OEMReporting'
import { useToast } from '../../hooks/useToast'
import {
  EMPTY_OEM_REPORT,
  exportOemReporting,
  getOemReporting,
} from '../../services/api/superAdminOemReportingService'

export default function OemReportingPage() {
  const { showToast } = useToast()
  const [report, setReport] = useState(EMPTY_OEM_REPORT)
  const [brand, setBrand] = useState('All Brands')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (nextBrand = 'All Brands') => {
    setLoading(true)
    try {
      const result = await getOemReporting(nextBrand)
      setReport(result)
      setBrand(result.selectedBrand || nextBrand || 'All Brands')
    } catch (err) {
      setReport(EMPTY_OEM_REPORT)
      showToast(err.message || 'Unable to load OEM reporting.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load('All Brands'), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const changeBrand = async (nextBrand) => {
    setBrand(nextBrand)
    try {
      const result = await getOemReporting(nextBrand)
      setReport(result)
      setBrand(result.selectedBrand || nextBrand)
    } catch (err) {
      showToast(err.message || 'Unable to load OEM reporting.', 'error')
    }
  }

  const exportReport = async (format) => {
    try {
      await exportOemReporting(format, brand)
    } catch (err) {
      showToast(err.message || 'Unable to export OEM report.', 'error')
      throw err
    }
  }

  if (loading) {
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
        title={report.pageTitle || 'OEM Reporting'}
        description={
          report.description ||
          'Brand-level visibility for compliance and enterprise alignment.'
        }
        actions={<Badge variant="pending">READ ONLY</Badge>}
      />
      <p className="mb-4 -mt-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Reporting month: {report.reportingMonth}
      </p>
      <OEMReporting
        showHeader={false}
        report={report}
        onBrandChange={(value) => void changeBrand(value)}
        onExport={exportReport}
      />
    </div>
  )
}
