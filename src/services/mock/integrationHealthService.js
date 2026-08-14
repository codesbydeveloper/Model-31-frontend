import { delay } from '../../utils/delay'
import { initialIntegrationHealth } from '../../data/integrationHealth'

let health = structuredClone(initialIntegrationHealth)

export async function getIntegrationHealth() {
  await delay(280)
  return structuredClone(health)
}

export async function runHealthCheck() {
  await delay(1100)
  health = health.map((item) => {
    if (item.name === 'X') {
      return { ...item, status: 'DISCONNECTED', lastCheck: 'Just now', latencyMs: 0 }
    }
    if (item.name === 'Whatnot') {
      const status = Math.random() > 0.5 ? 'WARNING' : 'ERROR'
      return {
        ...item,
        status,
        lastCheck: 'Just now',
        latencyMs: Math.max(40, Math.round(item.latencyMs * (0.8 + Math.random() * 0.5))),
      }
    }
    if (item.name === 'CRM') {
      return {
        ...item,
        status: 'WARNING',
        lastCheck: 'Just now',
        latencyMs: Math.max(40, Math.round(item.latencyMs * (0.8 + Math.random() * 0.5))),
      }
    }
    return {
      ...item,
      status: 'HEALTHY',
      lastCheck: 'Just now',
      latencyMs: Math.max(40, Math.round(item.latencyMs * (0.8 + Math.random() * 0.5))),
      errors: Math.max(0, item.errors - 1),
    }
  })
  return structuredClone(health)
}

const integrationHealthService = {
  getIntegrationHealth,
  runHealthCheck,
}

export default integrationHealthService
