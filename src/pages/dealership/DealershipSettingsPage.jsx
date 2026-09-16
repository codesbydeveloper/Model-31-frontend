import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Toggle from '../../components/common/Toggle'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import dealershipSettingsService from '../../services/api/dealershipSettingsService'

const LABELS = {
  leadAlerts: 'Lead Alerts',
  crmAutoSync: 'CRM Auto Sync',
  appointmentReminders: 'Appointment Reminders',
  afterHoursRouting: 'After Hours Routing',
}

export default function DealershipSettingsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [settings, setSettings] = useState({
    leadAlerts: true,
    crmAutoSync: true,
    appointmentReminders: true,
    afterHoursRouting: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSettings(await dealershipSettingsService.getDealershipSettings())
    } catch (err) {
      showToast(err.message || 'Unable to load settings.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      setSettings(await dealershipSettingsService.updateDealershipSettings(settings))
      showToast('Settings saved successfully.')
    } catch (err) {
      showToast(err.message || 'Unable to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealership Settings"
        description={`Configuration for ${user?.dealership || 'this dealership'}.`}
      />
      <Card className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          Object.entries(LABELS).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={Boolean(settings[key])}
              onChange={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
            />
          ))
        )}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <LoadingSpinner size={16} /> : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
