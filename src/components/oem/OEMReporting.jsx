import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Select from '../common/Select'
import { useToast } from '../../hooks/useToast'
import {
  OEM_COMPLIANCE_NOTICE_BODY,
  OEM_COMPLIANCE_NOTICE_TITLE,
} from '../../data/oemReporting'
import OEMComplianceNotice from './OEMComplianceNotice'
import OEMSummaryTable from './OEMSummaryTable'
import OEMExportButtons from './OEMExportButtons'

export default function OEMReporting({
  showHeader = true,
  report,
  onBrandChange,
  onExport,
}) {
  const { showToast } = useToast()
  const [brand, setBrand] = useState(report?.selectedBrand || 'All Brands')

  useEffect(() => {
    if (report?.selectedBrand) setBrand(report.selectedBrand)
  }, [report?.selectedBrand])

  const rows = report?.rows || []
  const month = report?.reportingMonth || ''
  const brandOptions = (report?.brands || []).map((item) => ({
    value: item,
    label: item,
  }))

  const changeBrand = (value) => {
    setBrand(value)
    onBrandChange?.(value)
  }

  return (
    <section aria-labelledby={showHeader ? 'oem-reporting-title' : undefined}>
      {showHeader ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="oem-reporting-title" className="text-lg font-semibold sm:text-xl">
                OEM Reporting
              </h2>
              <Badge variant="pending">READ ONLY</Badge>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
              Brand-level visibility for compliance and enterprise alignment.
            </p>
            {month ? (
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Reporting month: {month}
              </p>
            ) : null}
          </div>
          {brandOptions.length > 0 ? (
            <Select
              value={brand}
              onChange={(e) => changeBrand(e.target.value)}
              options={brandOptions}
              className="sm:w-44"
              aria-label="Filter OEM brands"
            />
          ) : null}
        </div>
      ) : brandOptions.length > 0 ? (
        <div className="mb-4 flex justify-end">
          <Select
            value={brand}
            onChange={(e) => changeBrand(e.target.value)}
            options={brandOptions}
            className="sm:w-44"
            aria-label="Filter OEM brands"
          />
        </div>
      ) : null}

      <Card>
        <OEMComplianceNotice
          title={report?.tableTitle || OEM_COMPLIANCE_NOTICE_TITLE}
          body={report?.complianceNote || OEM_COMPLIANCE_NOTICE_BODY}
        />

        <div className="mt-5">
          {rows.length > 0 ? (
            <OEMSummaryTable rows={rows} />
          ) : (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
              No OEM reporting data yet.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border-default)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            {report?.footer || 'View and export only.'}
          </p>
          <OEMExportButtons
            rows={rows}
            month={month}
            onExport={onExport}
            onExported={(type) =>
              showToast(
                type === 'csv'
                  ? 'OEM report CSV downloaded.'
                  : 'OEM report JSON downloaded.',
              )
            }
          />
        </div>
      </Card>
    </section>
  )
}
