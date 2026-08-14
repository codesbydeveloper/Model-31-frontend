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
import { useToast } from '../../hooks/useToast'
import socialService from '../../services/mock/socialService'
import { CONTENT_TYPES, LANGUAGES } from '../../data/marketingContent'

export default function SocialAccountsPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [active, setActive] = useState(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    platform: 'Instagram',
    accountName: '',
    environment: 'Production',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAccounts(await socialService.getSocialAccounts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Social Accounts"
        description="Connect and manage dealership social platforms (mock connections only)."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <SocialPlatformCard
              key={account.id}
              account={account}
              onConnect={(acc) => {
                setActive(acc)
                setForm({
                  platform: acc.platform,
                  accountName: acc.accountName || '',
                  environment: acc.environment || 'Production',
                })
                setConnectOpen(true)
              }}
              onDisconnect={setDisconnectTarget}
              onSettings={(acc) => {
                setActive(acc)
                setSettingsOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title="Connect Account">
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            try {
              await socialService.connectSocialAccount(form)
              setConnectOpen(false)
              showToast(`${form.platform} connected.`)
              await load()
            } finally {
              setBusy(false)
            }
          }}
        >
          <Input label="Platform" value={form.platform} readOnly />
          <Input
            label="Account Name"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            required
          />
          <Select
            label="Environment"
            value={form.environment}
            onChange={(e) => setForm({ ...form, environment: e.target.value })}
            options={[
              { value: 'Production', label: 'Production' },
              { value: 'Sandbox', label: 'Sandbox' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConnectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <LoadingSpinner size={16} />
                  Connecting…
                </>
              ) : (
                'Connect Account'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={settingsOpen && Boolean(active)}
        onClose={() => setSettingsOpen(false)}
        title="Social Settings"
      >
        {active && (
          <div className="grid gap-4">
            <Input label="Account Name" value={active.accountName} readOnly />
            <Toggle
              label="Posting Enabled"
              checked={active.postingEnabled}
              onChange={async (next) => {
                const updated = await socialService.updateSocialSettings(active.id, {
                  postingEnabled: next,
                })
                setActive(updated)
                await load()
              }}
            />
            <Toggle
              label="Auto Publishing"
              checked={active.autoPublishing}
              onChange={async (next) => {
                const updated = await socialService.updateSocialSettings(active.id, {
                  autoPublishing: next,
                })
                setActive(updated)
                await load()
              }}
            />
            <Select
              label="Default Content Type"
              value={active.defaultContentType}
              onChange={async (e) => {
                const updated = await socialService.updateSocialSettings(active.id, {
                  defaultContentType: e.target.value,
                })
                setActive(updated)
                await load()
              }}
              options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Default Language"
              value={active.defaultLanguage}
              onChange={async (e) => {
                const updated = await socialService.updateSocialSettings(active.id, {
                  defaultLanguage: e.target.value,
                })
                setActive(updated)
                await load()
              }}
              options={LANGUAGES.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Default Timezone"
              value={active.defaultTimezone}
              onChange={async (e) => {
                const updated = await socialService.updateSocialSettings(active.id, {
                  defaultTimezone: e.target.value,
                })
                setActive(updated)
                await load()
              }}
              options={[
                { value: 'America/New_York', label: 'America/New_York' },
                { value: 'America/Chicago', label: 'America/Chicago' },
                { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
              ]}
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
          setBusy(true)
          try {
            await socialService.disconnectSocialAccount(disconnectTarget.id)
            setDisconnectTarget(null)
            showToast('Account disconnected.')
            await load()
          } finally {
            setBusy(false)
          }
        }}
        title="Disconnect account?"
        message="This is a mock disconnect. No real OAuth session is affected."
        confirmLabel="Disconnect"
        danger
        loading={busy}
      />
    </div>
  )
}
