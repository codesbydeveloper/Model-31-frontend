import { apiRequest } from './http'
import { extractList, extractItem, textValue, formatStamp } from './payload'

function numberValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return 0
}

function mapSlaRow(raw, index) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id || raw._id || raw.leadId || `sla_${index}`,
    leadId: raw.leadId || raw.id,
    customerName: textValue(raw.customerName),
    salesperson: textValue(raw.salesperson) || 'Unassigned',
    assignedAt: formatStamp(raw.assignedAt) || textValue(raw.assignedAt) || '—',
    acceptedAt: formatStamp(raw.acceptedAt) || textValue(raw.acceptedAt) || '—',
    responseTime: textValue(raw.responseTime) || '—',
    slaStatus: textValue(raw.slaStatus || raw.status) || 'ON TIME',
  }
}

function mapChart(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    label: textValue(raw.label || raw.day || raw.name),
    onTime: numberValue(raw.onTime, raw.withinSla),
    warning: numberValue(raw.warning, raw.nearSla),
    breached: numberValue(raw.breached, raw.outsideSla),
  }
}

export async function getBdcSla() {
  const payload = await apiRequest('/api/bdc/sla')
  const raw = extractItem(payload, ['sla', 'summary']) || payload?.data || payload
  const overviewSource = raw.overview || raw
  return {
    overview: {
      averageResponseTime:
        textValue(overviewSource.averageResponseTime) ||
        textValue(overviewSource.avgResponseTime) ||
        '—',
      withinSla: numberValue(overviewSource.withinSla, overviewSource.onTime),
      nearSla: numberValue(overviewSource.nearSla, overviewSource.warning),
      outsideSla: numberValue(overviewSource.outsideSla, overviewSource.breached),
    },
    chart: extractList(raw.chart || raw.performance, []).map(mapChart).filter(Boolean),
    rows: extractList(raw.rows || raw.leads || raw.items, ['rows']).map(mapSlaRow).filter(Boolean),
  }
}

const bdcSlaService = {
  getBdcSla,
}

export default bdcSlaService
