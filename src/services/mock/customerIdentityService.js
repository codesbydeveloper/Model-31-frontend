import { delay } from '../../utils/delay'
import { initialCustomers } from '../../data/customerIdentity'

let customers = structuredClone(initialCustomers)

export async function getCustomerIdentity() {
  await delay(300)
  return structuredClone(customers)
}

export async function getCustomerById(id) {
  await delay(250)
  const item = customers.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

export async function mergeCustomerRecords(primaryId, duplicateId) {
  await delay(700)
  const primary = customers.find((c) => c.id === primaryId)
  const duplicate = customers.find((c) => c.id === duplicateId)
  if (!primary || !duplicate) throw new Error('Customer not found')

  primary.leadIds = [...new Set([...(primary.leadIds || []), ...(duplicate.leadIds || [])])]
  primary.channels = [...new Set([...(primary.channels || []), ...(duplicate.channels || [])])]
  primary.timeline = [
    {
      id: `ct_merge_${Date.now()}`,
      event: 'Records Merged',
      time: 'Just now',
      detail: `Merged ${duplicate.model31Id} into ${primary.model31Id}`,
    },
    ...(primary.timeline || []),
    ...(duplicate.timeline || []),
  ]
  primary.potentialDuplicates = (primary.potentialDuplicates || []).filter(
    (id) => id !== duplicateId,
  )
  customers = customers.map((c) =>
    c.id === duplicateId
      ? { ...c, status: 'MERGED', duplicateOf: primaryId, potentialDuplicates: [] }
      : c.id === primaryId
        ? primary
        : c,
  )
  return structuredClone(primary)
}

const customerIdentityService = {
  getCustomerIdentity,
  getCustomerById,
  mergeCustomerRecords,
}

export default customerIdentityService
