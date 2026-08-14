import { delay } from '../../utils/delay'
import {
  initialSocialAccounts,
  platformPerformanceCards,
} from '../../data/socialAccounts'

let accounts = structuredClone(initialSocialAccounts)

export async function getSocialAccounts() {
  await delay(280)
  return structuredClone(accounts)
}

export async function getPlatformPerformance() {
  await delay(250)
  return structuredClone(
    platformPerformanceCards.map((card) => {
      const live = accounts.find((a) => a.platform === card.platform)
      if (!live) return card
      return {
        platform: live.platform,
        connected: live.status === 'CONNECTED',
        posts: live.posts,
        reach: live.reach,
        engagement: live.engagement,
        leads: live.leads,
      }
    }),
  )
}

export async function connectSocialAccount({ platform, accountName, environment }) {
  await delay(900)
  const index = accounts.findIndex((a) => a.platform === platform)
  if (index === -1) {
    const created = {
      id: `soc_${Date.now()}`,
      platform,
      status: 'CONNECTED',
      accountName,
      environment: environment || 'Production',
      lastSync: 'Just now',
      posts: 0,
      followers: 0,
      reach: 0,
      engagement: 0,
      leads: 0,
      postingEnabled: true,
      autoPublishing: false,
      defaultContentType: 'Social Post',
      defaultLanguage: 'English',
      defaultTimezone: 'America/New_York',
    }
    accounts = [created, ...accounts]
    return structuredClone(created)
  }
  accounts[index] = {
    ...accounts[index],
    status: 'CONNECTED',
    accountName: accountName || accounts[index].accountName,
    environment: environment || accounts[index].environment,
    lastSync: 'Just now',
    postingEnabled: true,
  }
  return structuredClone(accounts[index])
}

export async function disconnectSocialAccount(id) {
  await delay(500)
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Account not found')
  accounts[index] = {
    ...accounts[index],
    status: 'DISCONNECTED',
    postingEnabled: false,
    autoPublishing: false,
    lastSync: 'Just now',
  }
  return structuredClone(accounts[index])
}

export async function updateSocialSettings(id, payload) {
  await delay(400)
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) throw new Error('Account not found')
  accounts[index] = { ...accounts[index], ...payload, id }
  return structuredClone(accounts[index])
}

const socialService = {
  getSocialAccounts,
  getPlatformPerformance,
  connectSocialAccount,
  disconnectSocialAccount,
  updateSocialSettings,
}

export default socialService
