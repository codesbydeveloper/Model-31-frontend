import { apiRequest } from './http'
import { extractItem, textValue } from './payload'
import { LANGUAGES, TIMEZONES, initialPlatformSettings } from '../../data/settings'

const NOTIFICATION_KEYS = [
  { key: 'emailNotifications', label: 'Email Notifications' },
  { key: 'leadAlerts', label: 'Lead Alerts' },
  { key: 'systemAlerts', label: 'System Alerts' },
  { key: 'crmAlerts', label: 'CRM Alerts' },
]

const AI_CONTROL_KEYS = [
  { key: 'aiConversation', label: 'AI Conversation' },
  { key: 'leadQualification', label: 'Lead Qualification' },
  { key: 'leadDispatch', label: 'Lead Dispatch' },
  { key: 'socialPosting', label: 'Social Posting' },
  { key: 'crmSync', label: 'CRM Sync' },
  { key: 'systemAutonomy', label: 'System Autonomy' },
]

function boolValue(value, fallback = false) {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', 'on', '1', 'active', 'enabled'].includes(normalized)) return true
    if (['false', 'off', '0', 'inactive', 'disabled'].includes(normalized)) return false
  }
  return fallback
}

function asOptions(raw, fallback) {
  const items = (Array.isArray(raw) ? raw : fallback)
    .map((item) => textValue(item))
    .filter(Boolean)
  return items.length ? items : fallback
}

function withCurrent(options, current) {
  const value = textValue(current)
  if (value && !options.includes(value)) return [value, ...options]
  return options
}

function mapToggles(raw, fallback) {
  if (Array.isArray(raw?.toggles) || Array.isArray(raw?.items) || Array.isArray(raw)) {
    const list = Array.isArray(raw) ? raw : raw.toggles || raw.items
    const mapped = list
      .map((item, index) => {
        if (typeof item === 'string') {
          const match = fallback.find((row) => row.key === item) || { key: item, label: item }
          return { key: match.key, label: match.label, enabled: true }
        }
        if (!item || typeof item !== 'object') return null
        const key = textValue(item.key || item.id, fallback[index]?.key || `toggle_${index}`)
        const enabled = boolValue(
          item.enabled ?? item.value,
          String(item.status).toUpperCase() === 'ON',
        )
        return {
          key,
          label: textValue(item.label, fallback.find((row) => row.key === key)?.label || key),
          enabled,
        }
      })
      .filter(Boolean)
    if (mapped.length) return mapped
  }

  const source = raw && typeof raw === 'object' ? raw : {}
  return fallback.map((item) => ({
    key: item.key,
    label: item.label,
    enabled: boolValue(source[item.key], initialValue(item.key)),
  }))
}

function initialValue(key) {
  return (
    initialPlatformSettings.notifications[key] ??
    initialPlatformSettings.system[key] ??
    true
  )
}

function togglesToMap(toggles) {
  return Object.fromEntries((toggles || []).map((item) => [item.key, Boolean(item.enabled)]))
}

export function mapPlatformSettings(payload) {
  const raw = extractItem(payload, ['settings', 'platformSettings']) || payload || {}
  const general = raw.general || payload?.general || {}
  const notifications = raw.notifications || payload?.notifications || {}
  const ai =
    raw.aiAndSystemControls ||
    raw.system ||
    payload?.aiAndSystemControls ||
    payload?.system ||
    {}
  const options = raw.options || payload?.options || {}
  const timezone = textValue(general.timezone, initialPlatformSettings.general.timezone)
  const defaultLanguage = textValue(
    general.defaultLanguage,
    initialPlatformSettings.general.defaultLanguage,
  )

  return {
    pageTitle: textValue(payload?.pageTitle || raw.pageTitle, 'Platform Settings'),
    description: textValue(
      payload?.description || raw.description,
      'Manage global Model 31 platform configuration.',
    ),
    general: {
      platformName: textValue(general.platformName, initialPlatformSettings.general.platformName),
      timezone,
      defaultLanguage,
    },
    notifications: {
      title: textValue(notifications.title, 'Notification Settings'),
      toggles: mapToggles(notifications, NOTIFICATION_KEYS),
    },
    aiAndSystemControls: {
      title: textValue(ai.title, 'AI Settings & System Controls'),
      toggles: mapToggles(ai, AI_CONTROL_KEYS),
    },
    options: {
      timezones: withCurrent(asOptions(options.timezones, TIMEZONES), timezone),
      languages: withCurrent(asOptions(options.languages, LANGUAGES), defaultLanguage),
    },
    enforcementNote: textValue(payload?.enforcementNote || raw.enforcementNote),
    message: textValue(payload?.message || raw.message),
  }
}

export function toPlatformSettingsPayload(settings) {
  return {
    general: {
      platformName: String(settings.general?.platformName || '').trim(),
      timezone: String(settings.general?.timezone || '').trim(),
      defaultLanguage: String(settings.general?.defaultLanguage || '').trim(),
    },
    notifications: togglesToMap(settings.notifications?.toggles),
    aiAndSystemControls: togglesToMap(settings.aiAndSystemControls?.toggles),
  }
}

export async function getPlatformSettings() {
  const payload = await apiRequest('/api/super-admin/settings')
  return mapPlatformSettings(payload)
}

export async function savePlatformSettings(settings) {
  const payload = await apiRequest('/api/super-admin/settings', {
    method: 'PUT',
    body: toPlatformSettingsPayload(settings),
  })
  const mapped = mapPlatformSettings(payload)
  const hasSections = Boolean(
    payload?.general ||
      payload?.notifications ||
      payload?.aiAndSystemControls ||
      payload?.settings ||
      payload?.data?.general,
  )
  if (!hasSections) {
    return { ...settings, message: mapped.message }
  }
  return mapped
}
