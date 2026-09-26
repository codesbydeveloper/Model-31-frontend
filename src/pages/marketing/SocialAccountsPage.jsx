import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import Toggle from '../../components/common/Toggle'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import SocialPlatformCard from '../../components/marketing/SocialPlatformCard'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import { CONTENT_TYPES, LANGUAGES } from '../../data/marketingContent'
import {
  getSocialAccounts,
  getSocialAccount,
  updateSocialSettings,
  connectSocialAccount,
  disconnectSocialAccount,
} from '../../services/api/marketingSocialService'

const DEFAULT_TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Los_Angeles']

function initialConnectValues(fields, account) {
  const values = {}
  fields.forEach((field) => {
    if (field.name === 'accountName') {
      values[field.name] = account?.accountName || ''
      return
    }
    values[field.name] = ''
  })
  return values
}

export default function SocialAccountsPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectValues, setConnectValues] = useState({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [active, setActive] = useState(null)
  const [busy, setBusy] = useState(false)
  const [settings, setSettings] = useState(null)
  const [settingsOptions, setSettingsOptions] = useState({
    contentTypes: CONTENT_TYPES,
    languages: LANGUAGES,
    timezones: DEFAULT_TIMEZONES,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getSocialAccounts()
      setAccounts(result.items)
    } catch (err) {
      setAccounts([])
      showToast(err.message || 'Unable to load social accounts.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const closeConnect = () => {
    setConnectOpen(false)
    setConnectValues({})
    setActive(null)
  }

  const openConnect = (account) => {
    if (!account?.id) {
      showToast('This account has no id. Reload Social Accounts and try again.', 'error')
      return
    }
    const fields = account.connectForm?.fields || []
    setActive(account)
    setConnectValues(initialConnectValues(fields, account))
    setConnectOpen(true)
  }

  const submitConnect = async (event) => {
    event.preventDefault()
    if (!active?.id) return
    setBusy(true)
    try {
      await connectSocialAccount(active.id, connectValues, active.connectUrl)
      showToast(`${active.platform || 'Account'} connected.`)
      closeConnect()
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to connect account.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const openSettings = async (account) => {
    setActive(account)
    setSettings({
      accountName: account.accountName,
      model31Source: account.model31Source === 'ON',
      postingEnabled: Boolean(account.postingEnabled),
      autoPublishing: Boolean(account.autoPublishing),
      defaultContentType: account.defaultContentType || 'Vehicle Promotion',
      defaultLanguage: account.defaultLanguage || 'English',
      defaultTimezone: account.defaultTimezone || 'America/New_York',
    })
    setSettingsOpen(true)
    setSettingsLoading(true)
    try {
      const detail = await getSocialAccount(account.id)
      if (detail.account) {
        setActive(detail.account)
        setSettings({
          accountName: detail.account.accountName,
          model31Source: detail.account.model31Source === 'ON',
          postingEnabled: Boolean(detail.account.postingEnabled),
          autoPublishing: Boolean(detail.account.autoPublishing),
          defaultContentType: detail.account.defaultContentType || 'Vehicle Promotion',
          defaultLanguage: detail.account.defaultLanguage || 'English',
          defaultTimezone: detail.account.defaultTimezone || 'America/New_York',
        })
      }
      setSettingsOptions({
        contentTypes: detail.options.contentTypes?.length
          ? detail.options.contentTypes
          : CONTENT_TYPES,
        languages: detail.options.languages?.length ? detail.options.languages : LANGUAGES,
        timezones: detail.options.timezones?.length ? detail.options.timezones : DEFAULT_TIMEZONES,
      })
    } catch (err) {
      showToast(err.message || 'Unable to load account settings.', 'error')
    } finally {
      setSettingsLoading(false)
    }
  }

  const saveSettings = async (next) => {
    if (!active) return
    const payload = { ...settings, ...next }
    setSettings(payload)
    setBusy(true)
    try {
      const updated = await updateSocialSettings(active.id, payload)
      if (updated) setActive(updated)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to save settings.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const setConnectField = (name, value) => {
    setConnectValues((current) => ({ ...current, [name]: value }))
  }

  const connectForm = active?.connectForm

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Social Accounts"
        description="Connect and manage dealership social platforms."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No social accounts yet"
          description="Accounts will appear here after the list API returns platforms to connect."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <SocialPlatformCard
              key={account.id || account.platform}
              account={account}
              onConnect={openConnect}
              onDisconnect={setDisconnectTarget}
              onSettings={openSettings}
            />
          ))}
        </div>
      )}

      <Modal
        open={connectOpen && Boolean(active)}
        onClose={closeConnect}
        title={connectForm?.title || (active?.platform ? `Connect ${active.platform}` : 'Connect Account')}
        className="max-w-xl"
      >
        <form className="grid gap-3" onSubmit={submitConnect}>
          {connectForm?.clientAsk ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <p>{connectForm.clientAsk}</p>
              {connectForm.helpUrl ? (
                <a
                  href={connectForm.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-amber-900 underline"
                >
                  {connectForm.helpUrl}
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          ) : null}
          {(connectForm?.fields || []).map((field) => {
            if (field.type === 'textarea') {
              return (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    className="input-field min-h-20"
                    value={connectValues[field.name] || ''}
                    onChange={(event) => setConnectField(field.name, event.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                  {field.help ? (
                    <p className="text-xs text-[var(--text-secondary)]">{field.help}</p>
                  ) : null}
                </div>
              )
            }
            return (
              <div key={field.name} className="grid gap-1">
                <Input
                  id={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type === 'password' ? 'password' : field.type}
                  value={connectValues[field.name] || ''}
                  onChange={(event) => setConnectField(field.name, event.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  autoComplete={field.type === 'password' ? 'new-password' : 'off'}
                />
                {field.help ? (
                  <p className="text-xs text-[var(--text-secondary)]">{field.help}</p>
                ) : null}
              </div>
            )
          })}
          <p className="text-xs text-[var(--text-secondary)]">
            Enter the developer app keys from the client. Do not enter the social account password.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeConnect}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !(connectForm?.fields || []).length}>
              {busy ? (
                <>
                  <LoadingSpinner size={16} />
                  Connecting…
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={settingsOpen && Boolean(active) && !connectOpen}
        onClose={() => setSettingsOpen(false)}
        title="Social Settings"
      >
        {settingsLoading || !settings ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <div className="grid gap-4">
            <Input
              label="Account Name"
              value={settings.accountName}
              onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
              onBlur={(e) => void saveSettings({ accountName: e.target.value })}
            />
            <Toggle
              label="Model 31 Source"
              checked={Boolean(settings.model31Source)}
              disabled={busy}
              onChange={(next) => void saveSettings({ model31Source: next })}
            />
            <Toggle
              label="Posting Enabled"
              checked={false}
              disabled
              onChange={() => {}}
            />
            <Toggle
              label="Auto Publishing"
              checked={false}
              disabled
              onChange={() => {}}
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Model 31 does not auto-publish. The salesperson copies the script into CapCut or Instagram.
            </p>
            <Select
              label="Default Content Type"
              value={settings.defaultContentType}
              onChange={(e) => void saveSettings({ defaultContentType: e.target.value })}
              options={settingsOptions.contentTypes.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Default Language"
              value={settings.defaultLanguage}
              onChange={(e) => void saveSettings({ defaultLanguage: e.target.value })}
              options={settingsOptions.languages.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Default Timezone"
              value={settings.defaultTimezone}
              onChange={(e) => void saveSettings({ defaultTimezone: e.target.value })}
              options={settingsOptions.timezones.map((t) => ({ value: t, label: t }))}
            />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(disconnectTarget)}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={async () => {
          if (!disconnectTarget) return
          setBusy(true)
          try {
            await disconnectSocialAccount(disconnectTarget.id, disconnectTarget.disconnectUrl)
            setDisconnectTarget(null)
            showToast('Account disconnected.')
            await load()
          } catch (err) {
            showToast(err.message || 'Unable to disconnect account.', 'error')
          } finally {
            setBusy(false)
          }
        }}
        title="Disconnect account?"
        message="Disconnect this social account from the dealership?"
        confirmLabel="Disconnect"
        danger
        loading={busy}
      />
    </div>
  )
}
