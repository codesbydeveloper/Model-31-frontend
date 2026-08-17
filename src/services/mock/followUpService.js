import { delay } from '../../utils/delay'
import {
  initialFollowUpSequences,
  FOLLOW_UP_CHANNELS,
} from '../../data/followUpSequences'

let sequences = structuredClone(initialFollowUpSequences)

const defaultSteps = [
  { day: 0, channel: 'Platform Message', message: 'Initial Message', status: 'ACTIVE' },
  { day: 2, channel: 'SMS', message: 'Still looking?', status: 'ACTIVE' },
  { day: 5, channel: 'Email', message: 'Want us to send some options?', status: 'ACTIVE' },
  { day: 7, channel: 'Manual Follow-Up', message: 'Found something that may work for you.', status: 'ACTIVE' },
]

export async function getFollowUpSequences() {
  await delay(300)
  return structuredClone(sequences)
}

export async function getFollowUpSequenceById(id) {
  await delay(250)
  const item = sequences.find((s) => s.id === id)
  return item ? structuredClone(item) : null
}

export async function createFollowUpSequence(payload) {
  await delay(600)
  const steps = (payload.steps || defaultSteps).map((s, i) => ({
    id: `step_${Date.now()}_${i}`,
    day: Number(s.day) || 0,
    channel: s.channel || FOLLOW_UP_CHANNELS[0],
    message: s.message || '',
    status: s.status || 'ACTIVE',
  }))
  const item = {
    id: `fu_${Date.now()}`,
    name: payload.name,
    description: payload.description || '',
    audience: payload.targetAudience || payload.audience || '',
    targetAudience: payload.targetAudience || '',
    trigger: payload.trigger || 'New Lead',
    steps,
    activeLeads: 0,
    completed: 0,
    conversion: 0,
    status: payload.status || 'DRAFT',
    activity: [
      {
        id: `fa_${Date.now()}`,
        label: 'Created',
        detail: 'Sequence created',
        time: 'Just now',
      },
    ],
  }
  sequences = [item, ...sequences]
  return structuredClone(item)
}

export async function updateFollowUpSequence(id, payload) {
  await delay(450)
  sequences = sequences.map((s) => (s.id === id ? { ...s, ...payload } : s))
  return structuredClone(sequences.find((s) => s.id === id))
}

export async function pauseFollowUpSequence(id) {
  return updateFollowUpSequence(id, { status: 'PAUSED' })
}

export async function resumeFollowUpSequence(id) {
  return updateFollowUpSequence(id, { status: 'ACTIVE' })
}

const followUpService = {
  getFollowUpSequences,
  getFollowUpSequenceById,
  createFollowUpSequence,
  updateFollowUpSequence,
  pauseFollowUpSequence,
  resumeFollowUpSequence,
}

export default followUpService
