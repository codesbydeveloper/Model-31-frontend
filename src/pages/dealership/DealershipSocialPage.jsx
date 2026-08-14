import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import SocialPlatformCard from '../../components/marketing/SocialPlatformCard'
import socialService from '../../services/mock/socialService'
import { useToast } from '../../hooks/useToast'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function DealershipSocialPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [form, setForm] = useState({
    platform: 'Instagram',
    accountName: '',
    environment: 'Production',
  })
  const [busy, setBusy] = useState(false)

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
        description="Connected dealership social platforms (mock connections only)."
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
                setForm({
                  platform: acc.platform,
                  accountName: acc.accountName || '',
                  environment: acc.environment || 'Production',
                })
                setConnectOpen(true)
              }}
              onDisconnect={setDisconnectTarget}
              onSettings={() => showToast('Settings available in mock social portal.')}
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
              {busy ? <LoadingSpinner size={16} /> : 'Connect Account'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(disconnectTarget)}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={async () => {
          await socialService.disconnectSocialAccount(disconnectTarget.id)
          setDisconnectTarget(null)
          showToast('Account disconnected.')
          await load()
        }}
        title="Disconnect account?"
        message="This is a mock disconnect."
        confirmLabel="Disconnect"
        danger
      />
    </div>
  )
}
