import { useCallback, useEffect, useState } from 'react'
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

export default function SocialAccountsPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [missingNotice, setMissingNotice] = useState(null)
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

  const openConnect = async (account) => {
    if (!account?.connectUrl) {
      showToast('This card has no server id yet. Reload Social Accounts, then connect.', 'error')
      return
    }
    if (account.connectForm?.credentialsConfigured === false) {
      setMissingNotice({
        platform: account.platform || 'This network',
        names: account.connectForm.missingEnv?.length
          ? account.connectForm.missingEnv
          : ['Server keys are not set.'],
      })
      return
    }
    setBusy(true)
    try {
      await connectSocialAccount(account.id, account.connectUrl)
      showToast(`${account.platform || 'Account'} connected.`)
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
        open={Boolean(missingNotice)}
        onClose={() => setMissingNotice(null)}
        title={`${missingNotice?.platform || 'Network'} keys are missing`}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Connect cannot run until these server settings are filled in and the API is restarted.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-medium">
          {(missingNotice?.names || []).map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setMissingNotice(null)}>
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        open={settingsOpen && Boolean(active)}
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
