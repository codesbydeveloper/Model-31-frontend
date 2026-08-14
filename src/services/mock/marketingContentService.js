import { delay } from '../../utils/delay'
import {
  initialMarketingContent,
  marketingDashboardStats,
  MOCK_GENERATIONS,
  MOCK_VIDEO_SCRIPTS,
} from '../../data/marketingContent'
import { initialMarketingNotifications } from '../../data/marketingNotifications'

let content = structuredClone(initialMarketingContent)

function stamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pushActivity(item, description, actor = 'Taylor Quinn') {
  item.activity = [
    {
      id: `mact_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      description,
      actor,
      time: stamp(),
    },
    ...(item.activity || []),
  ]
}

export async function getDashboardStats() {
  await delay(250)
  const pending = content.filter((c) => c.status === 'PENDING APPROVAL').length
  return {
    ...marketingDashboardStats,
    pendingApproval: Math.max(marketingDashboardStats.pendingApproval, pending),
    totalContent: Math.max(marketingDashboardStats.totalContent, content.length),
  }
}

export async function getMarketingNotifications() {
  await delay(200)
  return structuredClone(initialMarketingNotifications)
}

export async function getContent() {
  await delay(300)
  return structuredClone(content)
}

export async function getContentById(id) {
  await delay(250)
  const item = content.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

export async function getApprovalQueue() {
  await delay(280)
  return structuredClone(content.filter((c) => c.status === 'PENDING APPROVAL'))
}

export async function generateMockContent(payload = {}) {
  await delay(1200)
  const pick = MOCK_GENERATIONS[Math.floor(Math.random() * MOCK_GENERATIONS.length)]
  const duration = payload.videoDuration || '30'
  return {
    title: pick.title,
    body: pick.content,
    hashtags: [...pick.hashtags],
    platform: payload.platform || 'Instagram',
    tone: payload.tone || 'Professional',
    language: payload.language || 'English',
    imagePrompt:
      payload.contentType === 'Image Prompt'
        ? payload.imagePrompt ||
          'Luxury black SUV parked outside a modern dealership at sunset.'
        : '',
    imageUrl: '',
    videoDuration: payload.contentType === 'Video Script' ? duration : '',
    scenes:
      payload.contentType === 'Video Script'
        ? structuredClone(MOCK_VIDEO_SCRIPTS[duration] || MOCK_VIDEO_SCRIPTS['30'])
        : [],
  }
}

export async function createContent(payload) {
  await delay(600)
  const item = {
    id: `mc_${Date.now()}`,
    title: payload.title || 'Untitled Content',
    contentType: payload.contentType || 'Social Post',
    platform: payload.platform || 'Instagram',
    dealership: payload.dealership || 'Miami Luxury Motors',
    campaign: payload.campaign || '',
    status: payload.status || 'DRAFT',
    createdBy: 'Taylor Quinn',
    createdDate: '2026-08-14',
    scheduledDate: null,
    vehicle: payload.vehicle || '',
    offer: payload.offer || '',
    tone: payload.tone || 'Professional',
    language: payload.language || 'English',
    audience: payload.audience || 'Luxury Buyer',
    brief: payload.brief || '',
    body: payload.body || '',
    hashtags: payload.hashtags || [],
    imagePrompt: payload.imagePrompt || '',
    imageUrl: payload.imageUrl || '',
    videoDuration: payload.videoDuration || '',
    scenes: payload.scenes || [],
    rejectionReason: '',
    changeRequests: [],
    performance: { reach: 0, engagement: 0, clicks: 0, leads: 0, appointments: 0 },
    activity: [],
  }
  pushActivity(item, 'Content created')
  if (payload.body) pushActivity(item, 'AI content generated', 'AI System')
  content = [item, ...content]
  return structuredClone(item)
}

export async function updateContent(id, payload) {
  await delay(450)
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Content not found')
  content[index] = { ...content[index], ...payload, id }
  pushActivity(content[index], 'Content edited')
  return structuredClone(content[index])
}

export async function duplicateContent(id) {
  await delay(400)
  const source = content.find((c) => c.id === id)
  if (!source) throw new Error('Content not found')
  const copy = {
    ...structuredClone(source),
    id: `mc_${Date.now()}`,
    title: `${source.title} (Copy)`,
    status: 'DRAFT',
    scheduledDate: null,
    rejectionReason: '',
    createdDate: '2026-08-14',
  }
  copy.activity = []
  pushActivity(copy, 'Content duplicated from ' + source.id)
  content = [copy, ...content]
  return structuredClone(copy)
}

export async function deleteContent(id) {
  await delay(350)
  content = content.filter((c) => c.id !== id)
  return true
}

export async function submitForApproval(id) {
  await delay(500)
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Content not found')
  content[index].status = 'PENDING APPROVAL'
  pushActivity(content[index], 'Submitted for approval')
  return structuredClone(content[index])
}

export async function approveContent(id) {
  await delay(500)
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Content not found')
  content[index].status = 'APPROVED'
  pushActivity(content[index], 'Approved')
  return structuredClone(content[index])
}

export async function rejectContent(id, reason) {
  await delay(500)
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Content not found')
  content[index].status = 'REJECTED'
  content[index].rejectionReason = reason
  pushActivity(content[index], `Rejected: ${reason}`)
  return structuredClone(content[index])
}

export async function requestChanges(id, request) {
  await delay(450)
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Content not found')
  content[index].status = 'PENDING APPROVAL'
  content[index].changeRequests = [
    { id: `cr_${Date.now()}`, text: request, time: stamp() },
    ...(content[index].changeRequests || []),
  ]
  pushActivity(content[index], `Requested changes: ${request}`)
  return structuredClone(content[index])
}

export async function markScheduled(id, scheduledDate) {
  const index = content.findIndex((c) => c.id === id)
  if (index === -1) return null
  content[index].status = 'SCHEDULED'
  content[index].scheduledDate = scheduledDate
  pushActivity(content[index], 'Scheduled')
  return structuredClone(content[index])
}

const marketingContentService = {
  getDashboardStats,
  getMarketingNotifications,
  getContent,
  getContentById,
  getApprovalQueue,
  generateMockContent,
  createContent,
  updateContent,
  duplicateContent,
  deleteContent,
  submitForApproval,
  approveContent,
  rejectContent,
  requestChanges,
  markScheduled,
}

export default marketingContentService
