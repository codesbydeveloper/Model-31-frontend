import { delay } from '../../utils/delay'
import {
  calculateCommission,
  initialCommissionRecords,
  initialSoldDeals,
} from '../../data/commission'
import { pushLeadActivity } from './salespersonService'

let soldDeals = structuredClone(initialSoldDeals)
let commissions = structuredClone(initialCommissionRecords)

function inRange(saleDate, range) {
  const d = new Date(saleDate)
  const now = new Date('2026-08-14')
  if (range === 'current') {
    return d.getFullYear() === 2026 && d.getMonth() === 7
  }
  if (range === 'previous') {
    return d.getFullYear() === 2026 && d.getMonth() === 6
  }
  if (range === 'last3') {
    const start = new Date('2026-05-14')
    return d >= start && d <= now
  }
  if (range === 'year') {
    return d.getFullYear() === 2026
  }
  return true
}

export async function getSoldDeals(salespersonId) {
  await delay(300)
  // Demo portal shows the full sold-deals mock book.
  void salespersonId
  return structuredClone(soldDeals)
}

export async function getSoldDealById(id) {
  await delay(250)
  const item = soldDeals.find((d) => d.id === id)
  return item ? structuredClone(item) : null
}

export async function createSoldDeal(payload) {
  await delay(700)
  const calc = calculateCommission(payload.salePrice)
  const deal = {
    id: `deal_${Date.now()}`,
    leadId: payload.leadId || '',
    customerName: payload.customerName,
    vehicle: payload.vehicle,
    dealership: payload.dealership || 'Miami Luxury Motors',
    salesperson: payload.salesperson || 'John Smith',
    salespersonId: payload.salespersonId || 'sp_001',
    salePrice: Number(payload.salePrice),
    saleDate: payload.saleDate,
    notes: payload.notes || '',
    status: 'SOLD',
  }
  soldDeals = [deal, ...soldDeals]

  const commission = {
    id: `comm_${Date.now()}`,
    dealId: deal.id,
    leadId: deal.leadId,
    customerName: deal.customerName,
    vehicle: deal.vehicle,
    dealership: deal.dealership,
    salesperson: deal.salesperson,
    salespersonId: deal.salespersonId,
    saleDate: deal.saleDate,
    ...calc,
    status: 'PENDING',
  }
  commissions = [commission, ...commissions]

  if (deal.leadId) {
    pushLeadActivity(deal.leadId, 'Deal marked sold')
    pushLeadActivity(deal.leadId, 'Commission calculated')
  }

  return structuredClone({ deal, commission })
}

export { calculateCommission }

export async function getCommissionRecords(salespersonId, range = 'current') {
  await delay(300)
  void salespersonId
  const list = commissions.filter((c) => inRange(c.saleDate, range))
  return structuredClone(list)
}

export async function getCommissionById(id) {
  await delay(250)
  const item = commissions.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

export async function getCommissionSummary(salespersonId, range = 'current') {
  await delay(280)
  const records = await getCommissionRecords(salespersonId, range)
  const sales = records.length
  const totalCommission = records.reduce((sum, r) => sum + r.totalCommission, 0)
  const pending = records
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.totalCommission, 0)
  const paid = records
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.totalCommission, 0)
  const avgDeal =
    sales > 0
      ? Math.round(records.reduce((sum, r) => sum + r.dealAmount, 0) / sales)
      : 0

  return {
    currentMonthSales: sales,
    currentMonthCommission: totalCommission,
    pendingCommission: pending,
    paidCommission: paid,
    averageDealValue: avgDeal,
  }
}

export async function updateCommissionStatus(id, status) {
  await delay(550)
  const index = commissions.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Commission not found')
  commissions[index] = { ...commissions[index], status }
  return structuredClone(commissions[index])
}

const commissionService = {
  calculateCommission,
  getCommissionRecords,
  getCommissionById,
  getCommissionSummary,
  updateCommissionStatus,
}

export const soldDealService = {
  getSoldDeals,
  getSoldDealById,
  createSoldDeal,
}

export default commissionService
