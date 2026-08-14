import { delay } from '../../utils/delay'
import {
  initialCrmIntegrations,
  initialSocialIntegrations,
} from '../../data/integrations'

let crm = structuredClone(initialCrmIntegrations)
let social = structuredClone(initialSocialIntegrations)

function nowStamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16)
}

export async function getCrmIntegrations() {
  await delay(300)
  return structuredClone(crm)
}

export async function connectCrm(id, environment = 'Production') {
  await delay(900)
  const index = crm.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('CRM not found')
  crm[index] = {
    ...crm[index],
    connectionStatus: 'Connected',
    environment,
    apiStatus: 'Healthy',
    lastSync: nowStamp(),
  }
  return structuredClone(crm[index])
}

export async function disconnectCrm(id) {
  await delay(600)
  const index = crm.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('CRM not found')
  crm[index] = {
    ...crm[index],
    connectionStatus: 'Disconnected',
    apiStatus: 'Not connected',
  }
  return structuredClone(crm[index])
}

export async function testCrmConnection(id) {
  await delay(800)
  const item = crm.find((c) => c.id === id)
  if (!item) throw new Error('CRM not found')
  if (item.connectionStatus !== 'Connected') {
    return { success: false, message: 'CRM is not connected.' }
  }
  return { success: true, message: 'Connection test successful.' }
}

export async function syncCrm(id) {
  await delay(1000)
  const index = crm.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('CRM not found')
  if (crm[index].connectionStatus !== 'Connected') {
    throw new Error('CRM is not connected.')
  }
  crm[index] = {
    ...crm[index],
    lastSync: nowStamp(),
    leadsSent: crm[index].leadsSent + Math.floor(Math.random() * 8) + 1,
  }
  return structuredClone(crm[index])
}

export async function getSocialIntegrations() {
  await delay(300)
  return structuredClone(social)
}

export async function connectSocial(id) {
  await delay(850)
  const index = social.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Social platform not found')
  social[index] = {
    ...social[index],
    connectionStatus: 'Connected',
    status: 'Active',
    lastActivity: nowStamp(),
  }
  return structuredClone(social[index])
}

export async function disconnectSocial(id) {
  await delay(600)
  const index = social.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Social platform not found')
  social[index] = {
    ...social[index],
    connectionStatus: 'Disconnected',
    status: 'Inactive',
  }
  return structuredClone(social[index])
}

const integrationService = {
  getCrmIntegrations,
  connectCrm,
  disconnectCrm,
  testCrmConnection,
  syncCrm,
  getSocialIntegrations,
  connectSocial,
  disconnectSocial,
}

export default integrationService
