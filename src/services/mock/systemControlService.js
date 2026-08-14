import { delay } from '../../utils/delay'
import {
  initialSystemControls,
  controlLabels,
  criticalControls,
} from '../../data/systemControls'

let controls = structuredClone(initialSystemControls)

export async function getSystemControls() {
  await delay(250)
  return {
    controls: structuredClone(controls),
    labels: { ...controlLabels },
    critical: [...criticalControls],
  }
}

export async function updateSystemControl(group, key, value) {
  await delay(400)
  if (!controls[group] || !(key in controls[group])) {
    throw new Error('Control not found')
  }
  controls[group][key] = value
  return structuredClone(controls)
}

export async function getControlStatusSummary() {
  await delay(200)
  const c = controls
  return {
    systemAutonomy: c.autonomy.aiAutonomy ? 'ACTIVE' : 'INACTIVE',
    leadDispatch: c.salesperson.leadDispatch ? 'ACTIVE' : 'INACTIVE',
    aiConversation: c.dealership.aiConversations ? 'ACTIVE' : 'INACTIVE',
    crmSync: c.dealership.crmSync ? 'ACTIVE' : 'INACTIVE',
    socialPublishing: c.social.socialPosting ? 'ACTIVE' : 'INACTIVE',
  }
}

const systemControlService = {
  getSystemControls,
  updateSystemControl,
  getControlStatusSummary,
}

export default systemControlService
