import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Toggle from '../../components/common/Toggle'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function DealershipSettingsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [settings, setSettings] = useState({
    leadAlerts: true,
    crmAutoSync: true,
    appointmentReminders: true,
    afterHoursRouting: false,
  })

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Breadcrumbs />
      <PageHeader
        title="Dealership Settings"
        description={`Configuration for ${user?.dealership || 'this dealership'} (mock).`}
      />
      <Card className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <Toggle
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            checked={value}
            onChange={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
          />
        ))}
        <div className="flex justify-end">
          <Button
            onClick={() => showToast('Settings saved successfully.')}
          >
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
