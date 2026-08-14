import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Toggle from '../../components/common/Toggle'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import settingsService from '../../services/mock/settingsService'
import { LANGUAGES, TIMEZONES } from '../../data/settings'

export default function PlatformSettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setSettings(await settingsService.getPlatformSettings())
      setLoading(false)
    })()
  }, [])

  const update = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
  }

  const onSave = async () => {
    setSaving(true)
    try {
      await settingsService.savePlatformSettings(settings)
      showToast('Platform settings saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <PageHeader
        title="Platform Settings"
        description="Manage global Model 31 platform configuration."
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
              onChange={(e) => update('general', 'platformName', e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <Select
              label="Timezone"
              value={settings.general.timezone}
              onChange={(e) => update('general', 'timezone', e.target.value)}
              options={TIMEZONES}
            />
            <Select
              label="Default Language"
              value={settings.general.defaultLanguage}
              onChange={(e) =>
                update('general', 'defaultLanguage', e.target.value)
              }
              options={LANGUAGES}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Notification Settings</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              label="Email Notifications"
              checked={settings.notifications.emailNotifications}
              onChange={(v) => update('notifications', 'emailNotifications', v)}
            />
            <Toggle
              label="Lead Alerts"
              checked={settings.notifications.leadAlerts}
              onChange={(v) => update('notifications', 'leadAlerts', v)}
            />
            <Toggle
              label="System Alerts"
              checked={settings.notifications.systemAlerts}
              onChange={(v) => update('notifications', 'systemAlerts', v)}
            />
            <Toggle
              label="CRM Alerts"
              checked={settings.notifications.crmAlerts}
              onChange={(v) => update('notifications', 'crmAlerts', v)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">AI Settings & System Controls</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              label="AI Conversation"
              checked={settings.system.aiConversation}
              onChange={(v) => update('system', 'aiConversation', v)}
            />
            <Toggle
              label="Lead Qualification"
              checked={settings.system.leadQualification}
              onChange={(v) => update('system', 'leadQualification', v)}
            />
            <Toggle
              label="Lead Dispatch"
              checked={settings.system.leadDispatch}
              onChange={(v) => update('system', 'leadDispatch', v)}
            />
            <Toggle
              label="Social Posting"
              checked={settings.system.socialPosting}
              onChange={(v) => update('system', 'socialPosting', v)}
            />
            <Toggle
              label="CRM Sync"
              checked={settings.system.crmSync}
              onChange={(v) => update('system', 'crmSync', v)}
            />
            <Toggle
              label="System Autonomy"
              checked={settings.system.systemAutonomy}
              onChange={(v) => update('system', 'systemAutonomy', v)}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
