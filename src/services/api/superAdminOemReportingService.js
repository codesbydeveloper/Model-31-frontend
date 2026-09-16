import { API_BASE_URL } from '../../config/api'
import { apiRequest, ApiError, getAuthToken } from './http'
import { extractList, extractItem, textValue } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const num = Number(String(value).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(num)) return num
  }
  return 0
}

function isAllBrands(brand) {
  const value = String(brand || '').trim()
  return !value || value === 'All Brands' || value.toLowerCase() === 'all'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function mapOemReporting(payload, fallbackBrand = 'All Brands') {
  const raw = extractItem(payload, ['oemReporting']) || payload || {}
  const brands = extractList(raw, ['brandsFilter', 'brands'])
    .map((item) => textValue(item))
    .filter(Boolean)
  return {
    pageTitle: textValue(raw.pageTitle, 'OEM Reporting'),
    description: textValue(
      raw.description,
      'Brand-level visibility for compliance and enterprise alignment.',
    ),
    readOnly: raw.readOnly !== false,
    reportingMonth: textValue(raw.reportingMonth, '—'),
    brands: brands.length ? brands : ['All Brands'],
    selectedBrand: textValue(raw.selectedBrand, fallbackBrand),
    complianceNote: textValue(raw.complianceNote),
    tableTitle: textValue(raw.tableTitle, 'OEM Compliance Alignment'),
    footer: textValue(raw.footer, 'OEM reporting data. View and export only.'),
    rows: extractList(raw, ['rows']).map((row, index) => ({
      id: row.id || row._id || `oem_${index}`,
      brand: textValue(row.brand),
      stores: extractList(row, ['stores']).map((item) => textValue(item)).filter(Boolean),
      month: textValue(row.month, raw.reportingMonth),
      optIns: numberValue(row.optIns, row.optInsCount),
      salesInfluenced: numberValue(row.salesInfluenced),
      attribution: numberValue(row.attribution, row.attributionPercent),
      compliance: textValue(row.compliance),
    })),
  }
}

export const EMPTY_OEM_REPORT = mapOemReporting({
  reportingMonth: '—',
  brandsFilter: ['All Brands'],
  selectedBrand: 'All Brands',
  rows: [],
})

export async function getOemReporting(brand = '') {
  const params = new URLSearchParams()
  if (!isAllBrands(brand)) params.set('brand', String(brand).trim())
  const query = params.toString()
  const payload = await apiRequest(
    `/api/super-admin/oem-reporting${query ? `?${query}` : ''}`,
  )
  return mapOemReporting(payload, isAllBrands(brand) ? 'All Brands' : brand)
}

export async function exportOemReporting(format = 'csv', brand = '') {
  const params = new URLSearchParams({
    format: String(format || 'csv').toLowerCase(),
  })
  if (!isAllBrands(brand)) params.set('brand', String(brand).trim())

  const token = getAuthToken()
  let response
  try {
    response = await fetch(
      `${API_BASE_URL}/api/super-admin/oem-reporting/export?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      },
    )
  } catch {
    throw new ApiError(
      'Cannot reach the server. Make sure the API is running on http://localhost:5000.',
    )
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(
      body?.message || body?.error || `Export failed (${response.status})`,
      response.status,
      body,
    )
  }

  const disposition = response.headers.get('content-disposition') || ''
  const match = String(disposition).match(/filename="?([^"]+)"?/i)
  const contentType = response.headers.get('content-type') || ''
  const wantsJson = String(format).toLowerCase() === 'json' || contentType.includes('application/json')

  if (wantsJson) {
    const payload = await response.json().catch(() => null)
    if (payload?.success === false) {
      throw new ApiError(payload?.message || payload?.error || 'Export failed.')
    }
    const filename = payload?.filename || match?.[1] || 'oem-reporting.json'
    const data = payload?.oemReporting ?? payload
    downloadBlob(
      new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json;charset=utf-8;' }),
      filename,
    )
    return
  }

  const blob = await response.blob()
  downloadBlob(blob, match?.[1] || `oem-reporting.${String(format || 'csv').toLowerCase()}`)
}
