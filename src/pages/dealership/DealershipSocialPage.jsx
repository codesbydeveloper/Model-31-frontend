import { useCallback, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import SocialPlatformCard from '../../components/marketing/SocialPlatformCard'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import dealershipSocialService, { isSmsAccount } from '../../services/api/dealershipSocialService'
import dealershipSettingsService from '../../services/api/dealershipSettingsService'
import { useToast } from '../../hooks/useToast'
import ConfirmModal from '../../components/common/ConfirmModal'

const SMS_PROVIDERS = [
  { value: 'Twilio', label: 'Twilio' },
  { value: 'Telnyx', label: 'Telnyx' },
  { value: 'Plivo', label: 'Plivo' },
  { value: 'Sinch', label: 'Sinch' },
  { value: 'Bandwidth', label: 'Bandwidth' },
]

const SMS_TIMEZONES = [
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
  { value: 'Asia/Kolkata', label: 'India — Kolkata' },
]

function TextMessagesCard({ account, busy, onConnect, onDisconnect, onEdit, onDelete }) {
  const phone = account.phoneNumber || account.accountName
  const connected = String(account.status || '').toUpperCase() === 'CONNECTED'
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <PlatformBadge platform="SMS" />
          <p className="mt-2 font-semibold">{phone || 'Text messages'}</p>
          {account.providerType ? (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{account.providerType}</p>
          ) : null}
          <div className="mt-3 text-sm">
            <p className="text-[var(--text-muted)]">Last updated</p>
            <p className="font-medium">{account.lastUpdated || '—'}</p>
          </div>
        </div>
        <StatusBadge status={account.status || 'CONNECTED'} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {connected ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button size="sm" disabled={busy} onClick={onConnect}>
            Connect
          </Button>
        )}
        <Button
          size="icon"
          variant="secondary"
          disabled={busy}
          aria-label="Edit text account"
          title="Edit"
          onClick={onEdit}
        >
          <Pencil size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={busy}
          aria-label="Delete text account"
          title="Delete"
          onClick={onDelete}
          style={{ color: 'var(--status-error)' }}
        >
          <Trash2 size={16} color="var(--status-error)" />
        </Button>
      </div>
    </Card>
  )
}

export default function DealershipSocialPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [smsBusy, setSmsBusy] = useState(false)
  const [smsEditOpen, setSmsEditOpen] = useState(false)
  const [smsEditLoading, setSmsEditLoading] = useState(false)
  const [smsSaving, setSmsSaving] = useState(false)
  const [smsDeleteOpen, setSmsDeleteOpen] = useState(false)
  const [smsForm, setSmsForm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAccounts(await dealershipSocialService.getDealershipSocialAccounts())
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

  const connect = async (account) => {
    setBusyId(account.id)
    try {
      await dealershipSocialService.connectDealershipSocialAccount(account.id)
      showToast('Account connected.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to connect account.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const pauseSms = async () => {
    setSmsBusy(true)
    try {
      const message = await dealershipSettingsService.disconnectDealershipSmsAccount()
      showToast(message)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to disconnect the text account.', 'error')
    } finally {
      setSmsBusy(false)
    }
  }

  const resumeSms = async () => {
    setSmsBusy(true)
    try {
      const message = await dealershipSettingsService.connectDealershipSmsAccount()
      showToast(message)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to connect the text account.', 'error')
    } finally {
      setSmsBusy(false)
    }
  }

  const openSmsEdit = async () => {
    setSmsEditOpen(true)
    setSmsEditLoading(true)
    setSmsForm(null)
    try {
      const saved = await dealershipSettingsService.getDealershipSmsAccount()
      setSmsForm({
        providerType: saved?.providerType || 'Twilio',
        accountSid: saved?.accountSid || '',
        authToken: '',
        phoneNumber: saved?.phoneNumber || '',
        timezone: saved?.timezone || 'America/New_York',
        carrierProfileId: saved?.carrierProfileId || '',
        hasAuthToken: Boolean(saved?.hasAuthToken),
      })
    } catch (err) {
      setSmsEditOpen(false)
      showToast(err.message || 'Unable to load the text account.', 'error')
    } finally {
      setSmsEditLoading(false)
    }
  }

  const saveSmsEdit = async (event) => {
    event.preventDefault()
    if (!smsForm) return
    setSmsSaving(true)
    try {
      await dealershipSettingsService.updateDealershipSmsAccount({
        ...smsForm,
        phoneNumber: smsForm.phoneNumber.replace(/\s/g, ''),
        carrierProfileId: ['Sinch', 'Bandwidth'].includes(smsForm.providerType)
          ? smsForm.carrierProfileId
          : '',
      })
      setSmsEditOpen(false)
      showToast('Text account updated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update the text account.', 'error')
    } finally {
      setSmsSaving(false)
    }
  }

  const deleteSms = async () => {
    setSmsBusy(true)
    try {
      const message = await dealershipSettingsService.deleteDealershipSmsAccount()
      setSmsDeleteOpen(false)
      showToast(message)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to delete the text account.', 'error')
    } finally {
      setSmsBusy(false)
    }
  }

  const toggleSource = async (account) => {
    const next = account.model31Source === 'ON' ? 'OFF' : 'ON'
    setBusyId(account.id)
    try {
      await dealershipSocialService.updateDealershipSocialSource(account.id, next)
      showToast(`Model 31 Source ${next}.`)
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update source.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Social Accounts"
        description="Connected dealership social platforms."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No social accounts"
          description="Connected social accounts for this dealership will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...accounts]
            .sort((a, b) => Number(isSmsAccount(a)) - Number(isSmsAccount(b)))
            .map((account) =>
              isSmsAccount(account) ? (
                <TextMessagesCard
                  key={account.id}
                  account={account}
                  busy={smsBusy || smsSaving}
                  onConnect={resumeSms}
                  onDisconnect={pauseSms}
                  onEdit={openSmsEdit}
                  onDelete={() => setSmsDeleteOpen(true)}
                />
              ) : (
                <SocialPlatformCard
                  key={account.id}
                  account={{
                    ...account,
                    canConnect: String(account.status || '').toUpperCase() !== 'CONNECTED',
                  }}
                  busy={busyId === account.id}
                  onConnect={connect}
                  onDisconnect={setDisconnectTarget}
                  onSettings={() => {
                    if (busyId) return
                    void toggleSource(account)
                  }}
                />
              ),
            )}
        </div>
      )}

      <ConfirmModal
        open={Boolean(disconnectTarget)}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={async () => {
          try {
            await dealershipSocialService.disconnectDealershipSocialAccount(
              disconnectTarget.id,
            )
            setDisconnectTarget(null)
            showToast('Account disconnected.')
            await load()
          } catch (err) {
            showToast(err.message || 'Unable to disconnect account.', 'error')
          }
        }}
        title="Disconnect account?"
        message={`Disconnect ${disconnectTarget?.accountName || 'this account'}?`}
        confirmLabel="Disconnect"
        danger
      />

      <Modal
        open={smsEditOpen}
        onClose={() => !smsSaving && setSmsEditOpen(false)}
        title="Edit text account"
      >
        {smsEditLoading || !smsForm ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={saveSmsEdit}>
            <Select
              label="Text company"
              value={smsForm.providerType}
              options={SMS_PROVIDERS}
              onChange={(event) => setSmsForm((current) => ({ ...current, providerType: event.target.value }))}
            />
            <Input
              label="Account key"
              value={smsForm.accountSid}
              autoComplete="off"
              onChange={(event) => setSmsForm((current) => ({ ...current, accountSid: event.target.value }))}
            />
            <Input
              label="Secret key"
              type="password"
              value={smsForm.authToken}
              autoComplete="new-password"
              placeholder={smsForm.hasAuthToken ? 'Leave blank to keep the saved secret' : 'The secret key from the text company'}
              onChange={(event) => setSmsForm((current) => ({ ...current, authToken: event.target.value }))}
            />
            {['Sinch', 'Bandwidth'].includes(smsForm.providerType) && (
              <Input
                label="Extra ID"
                value={smsForm.carrierProfileId}
                autoComplete="off"
                onChange={(event) => setSmsForm((current) => ({ ...current, carrierProfileId: event.target.value }))}
              />
            )}
            <Input
              label="Phone number customers text"
              value={smsForm.phoneNumber}
              autoComplete="off"
              onChange={(event) => setSmsForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            />
            <Select
              label="Dealership timezone"
              value={smsForm.timezone}
              options={SMS_TIMEZONES}
              onChange={(event) => setSmsForm((current) => ({ ...current, timezone: event.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" disabled={smsSaving} onClick={() => setSmsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={smsSaving}>
                {smsSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={smsDeleteOpen}
        onClose={() => !smsBusy && setSmsDeleteOpen(false)}
        onConfirm={deleteSms}
        title="Delete text account?"
        message="This removes the saved text company, keys, and phone number."
        confirmLabel="Delete"
        danger
        loading={smsBusy}
      />
    </div>
  )
}
