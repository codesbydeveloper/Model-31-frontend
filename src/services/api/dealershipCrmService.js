import { apiRequest } from './http'
import { extractItem, extractList, textValue, formatStamp } from './payload'

function mapCrm(raw) {
  if (!raw || typeof raw !== 'object') return null
  const activity = extractList(raw.activity || raw.events || raw.recentActivity, [])
  return {
    crmName: textValue(raw.crmName || raw.name || raw.provider) || 'CRM',
    status: textValue(raw.status || raw.connectionStatus) || 'CONNECTED',
    lastSync: formatStamp(raw.lastSync || raw.updatedAt) || '—',
    leadsSynced: Number(raw.leadsSynced ?? raw.leads ?? 0) || 0,
    customersSynced: Number(raw.customersSynced ?? raw.customers ?? 0) || 0,
    appointmentsSynced: Number(raw.appointmentsSynced ?? raw.appointments ?? 0) || 0,
    soldDealsSynced: Number(raw.soldDealsSynced ?? raw.soldDeals ?? raw.sold ?? 0) || 0,
    syncErrors: Number(raw.syncErrors ?? raw.errors ?? 0) || 0,
    activity: activity.map((item, index) => ({
      id: item.id || item._id || `crm_act_${index}`,
      event: textValue(item.event || item.message || item.type) || 'Sync event',
      status: textValue(item.status) || 'Success',
      crm: textValue(item.crm || raw.crmName),
      time: formatStamp(item.time || item.createdAt) || '—',
    })),
  }
}

export async function getDealershipCrm() {
  const payload = await apiRequest('/api/dealership/crm')
  return mapCrm(extractItem(payload, ['crm']) || payload)
}

export async function syncDealershipCrm() {
  const payload = await apiRequest('/api/dealership/crm/sync', { method: 'POST' })
  return mapCrm(extractItem(payload, ['crm'])) || true
}

const dealershipCrmService = {
  getDealershipCrm,
  syncDealershipCrm,
}

export default dealershipCrmService
