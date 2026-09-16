import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function mapRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const rate = Number(raw.commissionRate ?? raw.rate)
  return {
    id: raw.id || raw._id || raw.dealId,
    dealId: raw.dealId || raw.id,
    customerName: textValue(raw.customerName),
    vehicle: textValue(raw.vehicle),
    dealership: textValue(raw.dealership),
    dealAmount: numberValue(raw.dealAmount, raw.salePrice),
    commissionRate: Number.isFinite(rate) ? (rate > 1 ? rate / 100 : rate) : 0,
    baseCommission: numberValue(raw.baseCommission),
    bonus: numberValue(raw.bonus),
    totalCommission: numberValue(raw.totalCommission, raw.commission),
    status: textValue(raw.status) || 'PENDING',
    saleDate: formatStamp(raw.saleDate || raw.createdAt) || textValue(raw.saleDate),
  }
}

export async function getSalespersonCommission() {
  const payload = await apiRequest('/api/salesperson/commission')
  const raw = extractItem(payload, ['commission', 'summary']) || payload?.data || payload
  const records = extractList(
    raw.records ||
      raw.history ||
      raw.items ||
      payload?.data?.records ||
      payload?.records,
    ['records'],
  )
    .map(mapRecord)
    .filter(Boolean)

  return {
    summary: {
      currentMonthSales: numberValue(raw.currentMonthSales, raw.soldThisMonth),
      currentMonthCommission: numberValue(raw.currentMonthCommission, raw.commission),
      pendingCommission: numberValue(raw.pendingCommission),
      paidCommission: numberValue(raw.paidCommission),
      averageDealValue: numberValue(raw.averageDealValue),
    },
    records,
  }
}

const salespersonCommissionService = {
  getSalespersonCommission,
}

export default salespersonCommissionService
