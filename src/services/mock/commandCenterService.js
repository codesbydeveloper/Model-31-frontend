import { delay } from '../../utils/delay'
import leadService from './leadService'
import analyticsService from './analyticsService'
import salespersonService from './salespersonService'
import conversationService from './conversationService'
import { getPriority } from '../../data/bdcQueue'
import {
  commandKpis,
  dispatchMap,
  socialEngineRows,
  crmReadOnlySync,
  underwaterRescue,
  inboxMessages,
} from '../../data/commandCenter'
import { classifyLead, PIPELINE_TYPES } from '../../utils/pipeline'

function lastActivity(lead) {
  return lead.activity?.[0]?.description || lead.createdLabel || '—'
}

export function buildFingerprint(lead) {
  const classified = classifyLead(lead || {})
  const isModel31 = classified.pipelineType === PIPELINE_TYPES.MODEL31
  return {
    leadId: classified.id,
    customerName: classified.customerName,
    source: classified.source,
    rooftop: classified.dealership,
    vehicle: classified.vehicle,
    score: classified.score,
    tier: classified.tier,
    status: classified.status,
    salesperson: classified.salesperson || 'Unassigned',
    pipelineType: classified.pipelineType,
    classificationStatus: classified.classificationStatus,
    contentId: isModel31 ? classified.content_id : 'NOT APPLICABLE',
    trackingId: isModel31 ? classified.model31_tracking_id : 'NOT APPLICABLE',
    signature: isModel31 ? '✓ VERIFIED' : 'NOT APPLICABLE',
    engagementTimestamp: classified.timestamp || classified.createdLabel,
    conversationTimestamp: classified.createdLabel,
    dispatchTimestamp: classified.status === 'NEW' ? 'Pending' : classified.createdLabel,
    appointment: classified.status === 'CLOSED' || classified.status === 'ROUTED' ? 'Scheduled' : 'None',
    saleStatus: classified.status === 'CLOSED' ? 'Sold' : 'Open',
    qualification: `Score ${classified.score} · Tier ${classified.tier}`,
    stages: [
      { key: 'CONTENT', label: 'Content', detail: isModel31 ? classified.content_id : 'Dealership / CRM source' },
      { key: 'ENGAGEMENT', label: 'Engagement', detail: `${classified.source} · ${classified.timestamp || classified.createdLabel}` },
      { key: 'CONVERSATION', label: 'Conversation', detail: classified.createdLabel },
      { key: 'LEAD', label: 'Lead', detail: `${classified.id} · ${classified.classificationStatus}` },
      { key: 'DISPATCH', label: 'Dispatch', detail: classified.salesperson || 'Awaiting assignment' },
      { key: 'SALE', label: 'Sale', detail: classified.status === 'CLOSED' ? 'Sold' : 'In progress' },
    ],
  }
}

export async function getCommandCenter() {
  await delay(200)
  const [overview, leads, salespeople] = await Promise.all([
    analyticsService.getDashboardOverview(),
    leadService.getLeads(),
    salespersonService.getSalespeople(),
  ])

  const inboxLeadIds = Object.keys(inboxMessages)
  const inbox = await Promise.all(
    inboxLeadIds.map(async (id) => {
      const lead = leads.find((item) => item.id === id)
      if (!lead) return null
      const messages = await conversationService.getConversation(id)
      const latest = messages[messages.length - 1]
      return {
        id: lead.id,
        customerName: lead.customerName,
        tier: lead.tier,
        score: lead.score,
        latestMessage: inboxMessages[id] || latest?.text || 'No messages yet.',
        time: latest?.timestamp || lead.createdLabel,
        salesperson: lead.salesperson || 'Unassigned',
        priority: getPriority(lead.tier),
      }
    }),
  )

  return {
    overview,
    kpis: commandKpis.map((item) => ({
      ...item,
      value: overview.stats[item.key],
    })),
    leads: leads.map((lead) => ({
      ...lead,
      lastActivity: lastActivity(lead),
    })),
    salespeople,
    dispatchMap,
    inbox: inbox.filter(Boolean),
    socialEngineRows,
    crmReadOnlySync,
    underwaterRescue,
    rooftops: overview.performance,
  }
}

const commandCenterService = {
  getCommandCenter,
  buildFingerprint,
}

export default commandCenterService
