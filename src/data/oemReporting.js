export const OEM_REPORTING_MONTH = 'August 2026'

export const OEM_COMPLIANCE = {
  GOOD_STANDING: '✓ In Good Standing',
  REVIEW_REQUIRED: '⚠ Review Required',
}

export const OEM_BRANDS = ['Toyota', 'Honda', 'Ford']

export const initialOemReports = [
  {
    id: 'oem_toyota',
    brand: 'Toyota',
    stores: ['Store_01', 'Store_02'],
    month: OEM_REPORTING_MONTH,
    optIns: 1248,
    salesInfluenced: 312,
    attribution: 25,
    compliance: OEM_COMPLIANCE.GOOD_STANDING,
  },
  {
    id: 'oem_honda',
    brand: 'Honda',
    stores: ['Store_03'],
    month: OEM_REPORTING_MONTH,
    optIns: 850,
    salesInfluenced: 190,
    attribution: 22,
    compliance: OEM_COMPLIANCE.GOOD_STANDING,
  },
  {
    id: 'oem_ford',
    brand: 'Ford',
    stores: ['Store_04'],
    month: OEM_REPORTING_MONTH,
    optIns: 620,
    salesInfluenced: 145,
    attribution: 23,
    compliance: OEM_COMPLIANCE.GOOD_STANDING,
  },
]

export const OEM_COMPLIANCE_NOTICE_TITLE = 'OEM Compliance Alignment'

export const OEM_COMPLIANCE_NOTICE_BODY =
  'Model 31 operates fully within OEM guidelines. All routing, consent, and reporting follow brand standards and franchise rules. This section provides read-only visibility to confirm OEM-aligned performance and compliance.'

export function filterOemReports(rows, brand = 'all') {
  if (!brand || brand === 'all') return rows
  return rows.filter((row) => row.brand === brand)
}

export function toOemExportRows(rows) {
  return rows.map((row) => ({
    Brand: row.brand,
    Month: row.month,
    OptIns: row.optIns,
    SalesInfluenced: row.salesInfluenced,
    Attribution: `${row.attribution}%`,
    Compliance: String(row.compliance).replace(/^[✓⚠]\s*/, ''),
  }))
}
