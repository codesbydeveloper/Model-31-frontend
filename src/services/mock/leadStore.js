/**
 * Centralized mock lead synchronizer.
 * Keeps Super Admin, BDC, Salesperson, and Dispatch views consistent.
 */

import { scoreToTier } from '../../data/leads'

/** @type {Map<string, object>} */
const listeners = new Set()

export function subscribeLeadStore(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // ignore listener errors
    }
  })
}

/** Lazy refs to mutable service arrays — set by each service on load */
const refs = {
  saLeads: null,
  bdcQueue: null,
  bdcLeads: null,
  spLeads: null,
  offers: null,
}

export function registerLeadArrays(partial) {
  Object.assign(refs, partial)
}

function upsertSpLead(payload) {
  if (!refs.spLeads) return
  const list = refs.spLeads
  const index = list.findIndex((l) => l.id === payload.id)
  const base = {
    id: payload.id,
    customerName: payload.customerName || '',
    phone: payload.phone || '',
    email: payload.email || '',
    vehicle: payload.vehicle || '',
    budget: payload.budget || '',
    timeline: payload.timeline || '',
    location: payload.location || '',
    financing: payload.financing || '',
    score: payload.score || 0,
    tier: payload.tier || scoreToTier(payload.score || 0),
    status: payload.status || 'NEW',
    offerStatus: payload.offerStatus || 'OFFERED',
    dealership: payload.dealership || '',
    salespersonId: payload.salespersonId || 'sp_001',
    salesperson: payload.salesperson || 'John Smith',
    createdLabel: payload.createdLabel || 'Today',
    notes: payload.notes || [],
    activity: payload.activity || [],
  }
  if (index === -1) {
    list.unshift(base)
  } else {
    list[index] = { ...list[index], ...base }
  }
}

function patchSaLead(leadId, patch) {
  if (!refs.saLeads) return
  const index = refs.saLeads.findIndex((l) => l.id === leadId)
  if (index === -1) return
  refs.saLeads[index] = { ...refs.saLeads[index], ...patch }
}

function patchBdcQueue(leadId, patch) {
  if (!refs.bdcQueue) return
  const index = refs.bdcQueue.findIndex((l) => l.id === leadId)
  if (index === -1) return
  refs.bdcQueue[index] = { ...refs.bdcQueue[index], ...patch }
}

function patchBdcLead(leadId, patch) {
  if (!refs.bdcLeads) return
  const index = refs.bdcLeads.findIndex((l) => l.id === leadId)
  if (index === -1) return
  refs.bdcLeads[index] = { ...refs.bdcLeads[index], ...patch }
}

function patchOffer(leadId, patch) {
  if (!refs.offers) return
  const index = refs.offers.findIndex((l) => l.id === leadId)
  if (index === -1) {
    if (patch.offerStatus === 'OFFERED') {
      const fromQueue = refs.bdcQueue?.find((l) => l.id === leadId)
      const fromSa = refs.saLeads?.find((l) => l.id === leadId)
      const source = fromQueue || fromSa
      if (!source) return
      refs.offers.unshift({
        ...source,
        ...patch,
        id: leadId,
        offerStatus: 'OFFERED',
        expiresIn: 299,
      })
    }
    return
  }
  refs.offers[index] = { ...refs.offers[index], ...patch }
}

/**
 * BDC assigns a qualified lead to a salesperson → creates dispatch offer.
 */
export function syncAfterBdcAssign(leadId, salesperson) {
  const queueItem = refs.bdcQueue?.find((l) => l.id === leadId)
  const saItem = refs.saLeads?.find((l) => l.id === leadId)
  const source = queueItem || saItem || {}

  patchSaLead(leadId, {
    salesperson: salesperson.name,
    salespersonId: salesperson.id,
    status: 'ROUTED',
  })
  patchBdcQueue(leadId, {
    status: 'ASSIGNED',
    salesperson: salesperson.name,
    salespersonId: salesperson.id,
  })
  patchBdcLead(leadId, {
    status: 'ASSIGNED',
    bdcStatus: 'ASSIGNED',
    salesperson: salesperson.name,
    salespersonId: salesperson.id,
    responseTime: 'Pending',
  })
  patchOffer(leadId, {
    offerStatus: 'OFFERED',
    salespersonId: salesperson.id,
    salesperson: salesperson.name,
    expiresIn: 299,
    customerName: source.customerName,
    vehicle: source.vehicle,
    score: source.score,
    tier: source.tier,
    location: source.location,
    dealership: source.dealership,
    budget: source.budget,
    timeline: source.timeline,
    financing: source.financing,
  })
  upsertSpLead({
    ...source,
    id: leadId,
    salespersonId: salesperson.id,
    salesperson: salesperson.name,
    offerStatus: 'OFFERED',
    status: 'NEW',
    activity: [
      {
        id: `act_${Date.now()}`,
        description: `Lead assigned to ${salesperson.name}`,
        actor: 'BDC Manager',
        time: 'Just now',
      },
    ],
  })
  notify()
}

export function syncAfterAccept(leadId) {
  patchOffer(leadId, { offerStatus: 'ACCEPTED' })
  patchBdcQueue(leadId, { status: 'ACCEPTED' })
  patchBdcLead(leadId, {
    status: 'ACCEPTED',
    bdcStatus: 'ACCEPTED',
    responseTime: 'Just now',
  })
  patchSaLead(leadId, { status: 'ROUTED' })
  if (refs.spLeads) {
    const index = refs.spLeads.findIndex((l) => l.id === leadId)
    if (index !== -1) {
      refs.spLeads[index] = {
        ...refs.spLeads[index],
        offerStatus: 'ACCEPTED',
        status: refs.spLeads[index].status === 'NEW' ? 'NEW' : refs.spLeads[index].status,
      }
    }
  }
  notify()
}

export function syncAfterDecline(leadId) {
  patchOffer(leadId, { offerStatus: 'DECLINED' })
  patchBdcQueue(leadId, { status: 'DECLINED' })
  patchBdcLead(leadId, { status: 'DECLINED', bdcStatus: 'DECLINED' })
  if (refs.spLeads) {
    const index = refs.spLeads.findIndex((l) => l.id === leadId)
    if (index !== -1) {
      refs.spLeads[index] = { ...refs.spLeads[index], offerStatus: 'DECLINED' }
    }
  }
  notify()
}

export function syncAfterExpire(leadId) {
  patchOffer(leadId, { offerStatus: 'EXPIRED' })
  patchBdcQueue(leadId, { status: 'EXPIRED' })
  patchBdcLead(leadId, { status: 'EXPIRED', bdcStatus: 'EXPIRED' })
  if (refs.spLeads) {
    const index = refs.spLeads.findIndex((l) => l.id === leadId)
    if (index !== -1) {
      refs.spLeads[index] = { ...refs.spLeads[index], offerStatus: 'EXPIRED' }
    }
  }
  notify()
}

export function syncSpStatusToPlatform(leadId, status) {
  const map = {
    NEW: 'ROUTED',
    CONTACTED: 'ROUTED',
    APPOINTMENT: 'ROUTED',
    SOLD: 'CLOSED',
    'NOT SOLD': 'CLOSED',
  }
  patchSaLead(leadId, { status: map[status] || 'ROUTED' })
  patchBdcLead(leadId, {
    status: status === 'SOLD' ? 'CLOSED' : status === 'APPOINTMENT' ? 'ACCEPTED' : 'ACCEPTED',
  })
  notify()
}

export function syncSaAssign(leadId, salesperson) {
  syncAfterBdcAssign(leadId, salesperson)
}
