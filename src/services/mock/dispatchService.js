import { delay } from '../../utils/delay'
import {
  registerLeadArrays,
  syncAfterAccept,
  syncAfterDecline,
  syncAfterExpire,
} from './leadStore'

/** Offers start empty — BDC assign creates them via leadStore. */
let offers = []

registerLeadArrays({ offers })

function rebind() {
  registerLeadArrays({ offers })
}

export async function getIncomingOffers(salespersonId = 'sp_001') {
  await delay(250)
  rebind()
  return structuredClone(
    offers.filter(
      (item) =>
        item.offerStatus === 'OFFERED' &&
        (!item.salespersonId || item.salespersonId === salespersonId),
    ),
  )
}

export async function dispatchLead(leadId, salespersonId) {
  await delay(400)
  const existing = offers.find((item) => item.id === leadId)
  if (existing) {
    offers = offers.map((item) =>
      item.id === leadId
        ? { ...item, offerStatus: 'OFFERED', salespersonId, expiresIn: 299 }
        : item,
    )
  }
  rebind()
  return structuredClone(offers.find((item) => item.id === leadId))
}

export async function acceptOffer(leadId) {
  await delay(500)
  offers = offers.map((item) =>
    item.id === leadId ? { ...item, offerStatus: 'ACCEPTED' } : item,
  )
  rebind()
  syncAfterAccept(leadId)
  return structuredClone(offers.find((item) => item.id === leadId))
}

export async function declineOffer(leadId) {
  await delay(500)
  offers = offers.map((item) =>
    item.id === leadId ? { ...item, offerStatus: 'DECLINED' } : item,
  )
  rebind()
  syncAfterDecline(leadId)
  return structuredClone(offers.find((item) => item.id === leadId))
}

export async function expireOffer(leadId) {
  await delay(300)
  offers = offers.map((item) =>
    item.id === leadId ? { ...item, offerStatus: 'EXPIRED' } : item,
  )
  rebind()
  syncAfterExpire(leadId)
  return structuredClone(offers.find((item) => item.id === leadId))
}

const dispatchService = {
  getIncomingOffers,
  dispatchLead,
  acceptOffer,
  declineOffer,
  expireOffer,
}

export default dispatchService
