import { delay } from '../../utils/delay'
import {
  referralStats,
  initialReferrals,
  eligibleReferralCustomers,
} from '../../data/referrals'

let referrals = structuredClone(initialReferrals)

export async function getReferrals() {
  await delay(300)
  return {
    stats: { ...referralStats },
    rows: structuredClone(referrals),
    eligible: structuredClone(eligibleReferralCustomers),
  }
}

export async function createReferralRequest({ customerName, message }) {
  await delay(500)
  const item = {
    id: `ref_${Date.now()}`,
    referrer: customerName,
    referredPerson: 'Pending',
    source: 'Referral Request',
    date: 'Aug 14, 2026',
    status: 'REQUESTED',
    lead: '—',
    appointment: '—',
    sale: '—',
    message:
      message || 'Do you know someone who may be looking for a vehicle?',
    dealership: 'Miami Luxury Motors',
  }
  referrals = [item, ...referrals]
  return structuredClone(item)
}

export async function updateReferralStatus(id, status) {
  await delay(400)
  referrals = referrals.map((r) => (r.id === id ? { ...r, status } : r))
  return structuredClone(referrals.find((r) => r.id === id))
}

const referralService = {
  getReferrals,
  createReferralRequest,
  updateReferralStatus,
}

export default referralService
