import { apiRequest } from './http'
import { extractItem, textValue } from './payload'
import { controlLabels, criticalControls } from '../../data/systemControls'

const DEFAULT_TITLE = 'System Control Center'
const DEFAULT_DESCRIPTION =
  'Control platform automation, AI behavior, dispatch, social publishing and dealership operations.'

export const DEFAULT_GROUPS = [
  { id: 'salespersonControl', title: 'Salesperson Control' },
  { id: 'dealershipControl', title: 'Dealership Control' },
  { id: 'socialPostingControl', title: 'Social Posting Control' },
  { id: 'systemAutonomyControl', title: 'System Autonomy Control' },
]

function boolEnabled(value, fallback = false) {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', 'on', '1', 'active', 'enabled'].includes(normalized)) return true
    if (['false', 'off', '0', 'inactive', 'disabled'].includes(normalized)) return false
  }
  return fallback
}

function mapToggle(raw, index = 0) {
  if (typeof raw === 'string') {
    const key = raw
    return {
      key,
      label: controlLabels[key] || key,
      enabled: false,
      status: 'OFF',
      critical: criticalControls.has(key),
    }
  }
  if (!raw || typeof raw !== 'object') return null
  const key = textValue(raw.key || raw.id || raw.name, `toggle_${index}`)
  const enabled = boolEnabled(raw.enabled ?? raw.value, String(raw.status).toUpperCase() === 'ON')
  return {
    key,
    label: textValue(raw.label, controlLabels[key] || key),
    enabled,
    status: textValue(raw.status, enabled ? 'ON' : 'OFF'),
    critical: raw.critical === true || criticalControls.has(key),
  }
}

function mapGroup(raw, fallback) {
  if (Array.isArray(raw)) {
    return {
      id: fallback.id,
      title: fallback.title,
      toggles: raw.map(mapToggle).filter(Boolean),
    }
  }
  if (!raw || typeof raw !== 'object') {
    return { id: fallback.id, title: fallback.title, toggles: [] }
  }
  const list = Array.isArray(raw.toggles)
    ? raw.toggles
    : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.controls)
        ? raw.controls
        : null
  if (list) {
    return {
      id: fallback.id,
      title: textValue(raw.title || raw.label, fallback.title),
      toggles: list.map(mapToggle).filter(Boolean),
    }
  }
  const toggles = Object.entries(raw)
    .filter(([key, value]) => key !== 'title' && key !== 'label' && typeof value !== 'object')
    .map(([key, value]) =>
      mapToggle({
        key,
        enabled: boolEnabled(value),
        label: controlLabels[key] || key,
      }),
    )
    .filter(Boolean)
  return {
    id: fallback.id,
    title: textValue(raw.title || raw.label, fallback.title),
    toggles,
  }
}

function mapControlStatus(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (typeof item === 'string') {
          return { key: `status_${index}`, label: item, status: 'ACTIVE' }
        }
        if (!item || typeof item !== 'object') return null
        return {
          key: textValue(item.key || item.id, `status_${index}`),
          label: textValue(item.label, item.key || 'Status'),
          status: textValue(item.status, boolEnabled(item.enabled) ? 'ACTIVE' : 'INACTIVE'),
        }
      })
      .filter(Boolean)
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([key, value]) => ({
      key,
      label: controlLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      status: typeof value === 'string' ? value : boolEnabled(value) ? 'ACTIVE' : 'INACTIVE',
    }))
  }
  return []
}

function mapNuclear(raw = {}) {
  const enabled = boolEnabled(raw.enabled, String(raw.status).toUpperCase() === 'ON')
  return {
    enabled,
    status: textValue(raw.status, enabled ? 'ON' : 'OFF'),
    description: textValue(
      raw.description,
      enabled
        ? 'Model 31 may assist with advanced deal guidance within manager-defined limits.'
        : 'Model 31 operates in standard assist mode.',
    ),
  }
}

export function mapSystemControls(payload) {
  const raw = extractItem(payload, ['systemControls', 'controls', 'data']) || payload || {}
  const knownIds = new Set(DEFAULT_GROUPS.map((group) => group.id))
  const groups = DEFAULT_GROUPS.map((group) => mapGroup(raw[group.id] || payload?.[group.id], group))
  Object.keys(raw).forEach((key) => {
    if (!key.endsWith('Control') || knownIds.has(key)) return
    groups.push(
      mapGroup(raw[key], {
        id: key,
        title: key.replace(/Control$/, '').replace(/([A-Z])/g, ' $1').trim(),
      }),
    )
  })

  return {
    pageTitle: textValue(payload?.pageTitle || raw.pageTitle, DEFAULT_TITLE),
    description: textValue(payload?.description || raw.description, DEFAULT_DESCRIPTION),
    controlStatus: mapControlStatus(
      payload?.controlStatus || raw.controlStatus || payload?.summary || raw.summary,
    ),
    nuclearMode: mapNuclear(payload?.nuclearMode || raw.nuclearMode),
    groups,
    message: textValue(payload?.message || raw.message),
  }
}

export function toBulkPayload(groups, changes = null) {
  if (changes && typeof changes === 'object') return changes
  const body = {}
  ;(groups || []).forEach((group) => {
    body[group.id] = Object.fromEntries(
      (group.toggles || []).map((toggle) => [toggle.key, Boolean(toggle.enabled)]),
    )
  })
  return body
}

export async function getSystemControls() {
  const payload = await apiRequest('/api/super-admin/system-controls')
  return mapSystemControls(payload)
}

export async function setNuclearMode(enabled) {
  const payload = await apiRequest('/api/super-admin/system-controls/nuclear-mode', {
    method: 'PATCH',
    body: { enabled: Boolean(enabled) },
  })
  return mapSystemControls(payload)
}

export async function setSystemControlToggle(key, enabled) {
  const payload = await apiRequest(
    `/api/super-admin/system-controls/toggles/${encodeURIComponent(key)}`,
    {
      method: 'PATCH',
      body: { enabled: Boolean(enabled) },
    },
  )
  return mapSystemControls(payload)
}

export async function updateSystemControls(partial) {
  const payload = await apiRequest('/api/super-admin/system-controls', {
    method: 'PATCH',
    body: partial,
  })
  return mapSystemControls(payload)
}
