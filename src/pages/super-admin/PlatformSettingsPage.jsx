import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Toggle from '../../components/common/Toggle'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import { useToast } from '../../hooks/useToast'
import {
  getPlatformSettings,
  savePlatformSettings,
} from '../../services/api/superAdminSettingsService'

export default function PlatformSettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setSettings(await getPlatformSettings())
    } catch (err) {
      setSettings(null)
      setError(true)
      showToast(err.message || 'Unable to load platform settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const updateGeneral = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }))
  }

  const updateToggle = (section, key, enabled) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        toggles: prev[section].toggles.map((item) =>
          item.key === key ? { ...item, enabled } : item,
        ),
      },
    }))
  }

  const onSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const saved = await savePlatformSettings(settings)
      setSettings(saved)
      showToast(saved.message || 'Platform settings saved successfully.')
    } catch (err) {
      showToast(err.message || 'Unable to save platform settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error || !settings) {
    return <ErrorState onRetry={load} />
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <PageHeader
        title={settings.pageTitle}
        description={settings.description}
        actions={
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        }
      />

      <div className="space-y-5">
        <Card>
          <h2 className="text-base font-semibold">General Settings</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Platform Name"
              value={settings.general.platformName}
              onChange={(e) => updateGeneral('platformName', e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <Select
              label="Timezone"
              value={settings.general.timezone}
              onChange={(e) => updateGeneral('timezone', e.target.value)}
              options={settings.options.timezones}
            />
            <Select
              label="Default Language"
              value={settings.general.defaultLanguage}
              onChange={(e) => updateGeneral('defaultLanguage', e.target.value)}
              options={settings.options.languages}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">{settings.notifications.title}</h2>
          <div className="mt-4 space-y-4">
            {settings.notifications.toggles.map((item) => (
              <Toggle
                key={item.key}
                label={item.label}
                checked={item.enabled}
                onChange={(value) => updateToggle('notifications', item.key, value)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">{settings.aiAndSystemControls.title}</h2>
          <div className="mt-4 space-y-4">
            {settings.aiAndSystemControls.toggles.map((item) => (
              <Toggle
                key={item.key}
                label={item.label}
                checked={item.enabled}
                onChange={(value) => updateToggle('aiAndSystemControls', item.key, value)}
              />
            ))}
          </div>
          {settings.enforcementNote ? (
            <p className="mt-4 text-xs text-[var(--text-muted)]">{settings.enforcementNote}</p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
