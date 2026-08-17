import { delay } from '../../utils/delay'
import {
  acquisitionOverview,
  acquisitionFunnel,
  engagementOverview,
  acquisitionCharts,
} from '../../data/acquisitionAnalytics'
import leadService from './leadService'
import bdcService from './bdcService'
import { scoreToTier } from '../../data/leads'

export async function getAcquisitionOverview() {
  await delay(280)
  return {
    kpis: { ...acquisitionOverview },
    funnel: structuredClone(acquisitionFunnel),
    engagementOverview: { ...engagementOverview },
    charts: structuredClone(acquisitionCharts),
  }
}

export async function createMockLeadFromSignal(payload) {
  await delay(700)
  const score = Number(payload.score) || 78
  const lead = await leadService.createLead({
    customerName: payload.customerName,
    phone: payload.phone || '',
    email: payload.email || '',
    vehicle: payload.vehicle || 'SUV',
    budget: payload.budget || '',
    budgetValue: Number(String(payload.budget || '').replace(/[^\d]/g, '')) || 0,
    timeline: payload.timeline || 'This Month',
    location: payload.location || 'Miami',
    city: payload.location || 'Miami',
    financing: payload.financing || 'Lease',
    score,
    status: 'QUALIFIED',
    source: payload.source || 'Acquisition Signal',
    dealership: payload.dealership || 'Miami Luxury Motors',
    dealershipId: 'dlr_001',
  })
  await bdcService.enqueueQualifiedLead(lead)
  return {
    ...lead,
    tier: lead.tier || scoreToTier(score),
    intent: payload.intent || 'HIGH',
  }
}

const acquisitionService = {
  getAcquisitionOverview,
  createMockLeadFromSignal,
}

export default acquisitionService
