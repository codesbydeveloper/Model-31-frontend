import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import SocialPlatformCard from '../../components/marketing/SocialPlatformCard'
import dealershipSocialService from '../../services/api/dealershipSocialService'
import { useToast } from '../../hooks/useToast'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function DealershipSocialPage() {
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)

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
          {accounts.map((account) => (
            <SocialPlatformCard
              key={account.id}
              account={account}
              onConnect={() =>
                showToast('Connect is not available on this API.', 'error')
              }
              onDisconnect={setDisconnectTarget}
              onSettings={() => {
                if (busyId) return
                void toggleSource(account)
              }}
            />
          ))}
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
    </div>
  )
}
