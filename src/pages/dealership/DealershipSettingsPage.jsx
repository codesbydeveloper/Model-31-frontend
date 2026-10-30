import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Toggle from '../../components/common/Toggle'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Badge from '../../components/common/Badge'
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

const PROVIDERS = [
  { value: 'Twilio', label: 'Twilio' },
  { value: 'Telnyx', label: 'Telnyx' },
  { value: 'Plivo', label: 'Plivo' },
  { value: 'Sinch', label: 'Sinch' },
  { value: 'Bandwidth', label: 'Bandwidth' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern — New York' },
  { value: 'America/Toronto', label: 'Eastern — Toronto' },
  { value: 'America/Chicago', label: 'Central — Chicago' },
  { value: 'America/Winnipeg', label: 'Central — Winnipeg' },
  { value: 'America/Denver', label: 'Mountain — Denver' },
  { value: 'America/Edmonton', label: 'Mountain — Edmonton' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific — Los Angeles' },
  { value: 'America/Vancouver', label: 'Pacific — Vancouver' },
  { value: 'America/Halifax', label: 'Atlantic — Halifax' },
  { value: 'America/St_Johns', label: 'Newfoundland' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
]

const PROFILE_PROVIDERS = new Set(['Sinch', 'Bandwidth'])

const EMPTY_SMS = {
  providerType: 'Twilio',
  accountSid: '',
  authToken: '',
  phoneNumber: '',
  timezone: 'America/New_York',
  carrierProfileId: '',
  hasAuthToken: false,
  connected: false,
}

function needsProfileId(providerType) {
  return PROFILE_PROVIDERS.has(providerType)
}

function validateSms(form) {
  const errors = {}
  if (!form.providerType) errors.providerType = 'Choose the text company.'
  if (!form.accountSid.trim()) errors.accountSid = 'Enter the account key from the text company.'
  if (!form.authToken.trim() && !form.hasAuthToken) {
    errors.authToken = 'Enter the secret key from the text company.'
  }
  const phone = form.phoneNumber.replace(/\s/g, '')
  if (!phone) {
    errors.phoneNumber = 'Enter the phone number customers will text.'
  } else if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    errors.phoneNumber = 'Start with + and the country code, like +13051112222.'
  }
  if (!form.timezone) errors.timezone = 'Choose the dealership timezone.'
  if (needsProfileId(form.providerType) && !form.carrierProfileId.trim()) {
    errors.carrierProfileId = 'Sinch and Bandwidth need this extra ID.'
  }
  return errors
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
  const [sms, setSms] = useState(EMPTY_SMS)
  const [smsErrors, setSmsErrors] = useState({})
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSms, setSavingSms] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [settingsResult, smsResult] = await Promise.allSettled([
      dealershipSettingsService.getDealershipSettings(),
      dealershipSettingsService.getDealershipSmsAccount(),
    ])

    if (settingsResult.status === 'fulfilled') {
      setSettings(settingsResult.value)
    } else {
      showToast(settingsResult.reason?.message || 'Unable to load settings.', 'error')
    }

    if (smsResult.status === 'fulfilled' && smsResult.value) {
      setSms({ ...EMPTY_SMS, ...smsResult.value, authToken: '' })
    } else if (smsResult.status === 'rejected' && settingsResult.status === 'fulfilled') {
      showToast(smsResult.reason?.message || 'Unable to load text message settings.', 'error')
    }

    setLoading(false)
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

  const updateSms = (patch) => {
    setSms((prev) => ({ ...prev, ...patch }))
    setSmsErrors((prev) => {
      const next = { ...prev }
      Object.keys(patch).forEach((key) => {
        delete next[key]
      })
      return next
    })
  }

  const saveSms = async () => {
    const errors = validateSms(sms)
    setSmsErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSavingSms(true)
    try {
      const saved = await dealershipSettingsService.updateDealershipSmsAccount({
        ...sms,
        phoneNumber: sms.phoneNumber.replace(/\s/g, ''),
        carrierProfileId: needsProfileId(sms.providerType) ? sms.carrierProfileId : '',
      })
      setSms({
        ...EMPTY_SMS,
        ...saved,
        authToken: '',
      })
      setShowSecret(false)
      showToast('Text message account saved.')
    } catch (err) {
      showToast(
        err.message || 'Unable to save the text message account. The server API is not ready yet.',
        'error',
      )
    } finally {
      setSavingSms(false)
    }
  }

  const profileNeeded = needsProfileId(sms.providerType)

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

      <Card className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Text messages</h2>
            {!loading && (
              <Badge variant={sms.connected || sms.hasAuthToken ? 'ready' : 'pending'}>
                {sms.connected || sms.hasAuthToken ? 'Connected' : 'Not connected'}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Connect the text account this dealership already has. Customers text that number, and Model 31 replies with this account. The dealership keeps its own text bill and registration.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <div className="grid gap-4">
            <Select
              label="Text company"
              name="providerType"
              value={sms.providerType}
              error={smsErrors.providerType}
              options={PROVIDERS}
              onChange={(event) => updateSms({ providerType: event.target.value })}
            />
            <Input
              label="Account key"
              name="accountSid"
              value={sms.accountSid}
              error={smsErrors.accountSid}
              placeholder="The account ID from the text company"
              autoComplete="off"
              onChange={(event) => updateSms({ accountSid: event.target.value })}
            />
            <div>
              <Input
                label="Secret key"
                name="authToken"
                type={showSecret ? 'text' : 'password'}
                value={sms.authToken}
                error={smsErrors.authToken}
                placeholder={sms.hasAuthToken ? 'Leave blank to keep the saved secret' : 'The secret key from the text company'}
                autoComplete="new-password"
                onChange={(event) => updateSms({ authToken: event.target.value })}
              />
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-accent)] hover:underline"
                onClick={() => setShowSecret((value) => !value)}
              >
                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSecret ? 'Hide secret key' : 'Show secret key'}
              </button>
            </div>
            {profileNeeded && (
              <Input
                label="Extra ID"
                name="carrierProfileId"
                value={sms.carrierProfileId}
                error={smsErrors.carrierProfileId}
                placeholder={sms.providerType === 'Sinch' ? 'Sinch service plan ID' : 'Bandwidth application ID'}
                autoComplete="off"
                onChange={(event) => updateSms({ carrierProfileId: event.target.value })}
              />
            )}
            <Input
              label="Phone number customers text"
              name="phoneNumber"
              value={sms.phoneNumber}
              error={smsErrors.phoneNumber}
              placeholder="+13051112222"
              autoComplete="off"
              onChange={(event) => updateSms({ phoneNumber: event.target.value })}
            />
            <Select
              label="Dealership timezone"
              name="timezone"
              value={sms.timezone}
              error={smsErrors.timezone}
              options={TIMEZONES}
              onChange={(event) => updateSms({ timezone: event.target.value })}
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Texts that arrive at night are answered at 8 AM in this timezone. If a customer texts STOP, they are not texted again.
            </p>
            <div className="flex justify-end">
              <Button onClick={saveSms} disabled={savingSms}>
                {savingSms ? <LoadingSpinner size={16} /> : 'Save text account'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
