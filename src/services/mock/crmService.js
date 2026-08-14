import { delay } from '../../utils/delay'
import {
  crmSummaryStats,
  initialCrmIntegrations,
  initialCrmSyncErrors,
  initialCrmActivity,
  dealershipCrmDashboard,
} from '../../data/crmIntegrations'

let crm = structuredClone(initialCrmIntegrations)
let errors = structuredClone(initialCrmSyncErrors)
let activity = structuredClone(initialCrmActivity)

function stamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export async function getCRMSummary() {
  await delay(220)
  const connected = crm.filter((c) => c.status === 'CONNECTED' || c.status === 'SYNCING').length
  return {
    ...crmSummaryStats,
    connectedCrms: connected,
    syncErrors: errors.filter((e) => e.status === 'FAILED').length,
  }
}

export async function getCRMIntegrations() {
  await delay(280)
  return structuredClone(crm)
}

export async function getCRMById(id) {
  await delay(250)
  const item = crm.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

export async function syncCRM(id) {
  await delay(1200)
  const index = crm.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('CRM not found')
  if (crm[index].status === 'DISCONNECTED') throw new Error('CRM is not connected.')
  crm[index] = {
    ...crm[index],
    status: 'CONNECTED',
    lastSync: 'Just now',
    nextSync: 'in 15 minutes',
    recordsSynced: crm[index].recordsSynced + Math.floor(Math.random() * 40) + 10,
    syncErrors: Math.max(0, crm[index].syncErrors - 1),
  }
  activity = [
    {
      id: `cact_${Date.now()}`,
      event: 'Sync Completed',
      crm: crm[index].name,
      time: stamp(),
      status: 'SUCCESS',
    },
    {
      id: `cact_${Date.now()}_s`,
      event: 'CRM Sync Started',
      crm: crm[index].name,
      time: stamp(),
      status: 'SUCCESS',
    },
    ...activity,
  ]
  return structuredClone(crm[index])
}

export async function updateCRMSettings(id, payload) {
  await delay(450)
  const index = crm.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('CRM not found')
  crm[index] = { ...crm[index], ...payload, id }
  return structuredClone(crm[index])
}

export async function disconnectCRM(id) {
  await delay(500)
  const index = crm.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('CRM not found')
  crm[index] = {
    ...crm[index],
    status: 'DISCONNECTED',
    autoSync: false,
    nextSync: '—',
  }
  return structuredClone(crm[index])
}

export async function getCRMSyncErrors(crmId) {
  await delay(250)
  const list = crmId ? errors.filter((e) => e.crmId === crmId) : errors
  return structuredClone(list)
}

export async function retryCRMError(errorId) {
  await delay(800)
  const index = errors.findIndex((e) => e.id === errorId)
  if (index === -1) throw new Error('Error not found')
  errors[index] = { ...errors[index], status: 'RETRIED' }
  activity = [
    {
      id: `cact_${Date.now()}`,
      event: 'Sync Error Retry',
      crm: crm.find((c) => c.id === errors[index].crmId)?.name || 'CRM',
      time: stamp(),
      status: 'SUCCESS',
    },
    ...activity,
  ]
  return structuredClone(errors[index])
}

export async function getCRMActivity(crmId) {
  await delay(250)
  let list = activity
  if (crmId) {
    const name = crm.find((c) => c.id === crmId)?.name
    list = activity.filter((a) => a.crm === name)
  }
  return structuredClone(list)
}

export async function getDealershipCrmDashboard() {
  await delay(250)
  return { ...dealershipCrmDashboard }
}

const crmService = {
  getCRMSummary,
  getCRMIntegrations,
  getCRMById,
  syncCRM,
  updateCRMSettings,
  disconnectCRM,
  getCRMSyncErrors,
  retryCRMError,
  getCRMActivity,
  getDealershipCrmDashboard,
}

export default crmService
