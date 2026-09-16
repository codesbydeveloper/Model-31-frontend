import { useCallback, useEffect, useState } from 'react'
import {
  MessageCircle,
  Music2,
  Video,
  AtSign,
  ShoppingBag,
  Share2,
  Camera,
  Settings,
  Link2,
  Unplug,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import DataTable from '../../components/common/DataTable'
import Toggle from '../../components/common/Toggle'
import {
  connectPlatform,
  disconnectPlatform,
  getPlatformSettings,
  getSocialIntegrations,
  setStaffModel31Source,
} from '../../services/api/superAdminSocialService'

const ICONS = {
  facebook: Share2,
  Facebook: Share2,
  instagram: Camera,
  Instagram: Camera,
  whatsapp: MessageCircle,
  WhatsApp: MessageCircle,
  tiktok: Music2,
  TikTok: Music2,
  youtube: Video,
  YouTube: Video,
  x: AtSign,
  X: AtSign,
  whatnot: ShoppingBag,
  Whatnot: ShoppingBag,
}

export default function SocialIntegrationsPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [accounts, setAccounts] = useState([])
  const [staffTitle, setStaffTitle] = useState('Authorized Staff Social Accounts')
  const [staffDescription, setStaffDescription] = useState(
    'Engagement from accounts with Model 31 Source ON is treated as a Model 31 source.',
  )
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [settingsTarget, setSettingsTarget] = useState(null)
  const [settings, setSettings] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getSocialIntegrations()
      setItems(result.platforms)
      setAccounts(result.staffAccounts)
      setStaffTitle(result.staffTitle)
      setStaffDescription(result.staffDescription)
    } catch (err) {
      setItems([])
      setAccounts([])
      showToast(err.message || 'Unable to load social integrations.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const connect = async (item) => {
    setBusyId(item.slug)
    try {
      const result = await connectPlatform(item.slug)
      showToast(result.message || 'Social platform connected successfully.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to connect platform.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const disconnect = async (item) => {
    setBusyId(item.slug)
    try {
      const result = await disconnectPlatform(item.slug)
      showToast(result.message || 'Social platform disconnected.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to disconnect platform.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const openSettings = async (item) => {
    setSettingsTarget(item)
    setSettings(null)
    setSettingsLoading(true)
    try {
      setSettings(await getPlatformSettings(item.slug))
    } catch (err) {
      showToast(err.message || 'Unable to load settings.', 'error')
      setSettings({
        title: `${item.name} Settings`,
        placeholder: 'Connect this account to manage inbox and posting settings.',
        account: null,
      })
    } finally {
      setSettingsLoading(false)
    }
  }

  const toggleSource = async (row, next) => {
    setTogglingId(row.id)
    try {
      await setStaffModel31Source(row.id, next)
      showToast('Social source setting updated.')
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update Model 31 source.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Social Integrations"
        description="Configure social channel integrations for dealership content and conversations."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            No social platforms found.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || ICONS[item.name] || MessageCircle
            return (
              <Card key={item.slug || item.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold">{item.name}</h2>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <StatusBadge status={item.connectionStatus} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--text-secondary)]">Last activity</dt>
                    <dd className="font-medium">{item.lastActivity}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--text-secondary)]">Posts</dt>
                    <dd className="font-medium">{formatNumber(item.posts)}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.canConnect ? (
                    <Button
                      size="sm"
                      disabled={busyId === item.slug}
                      onClick={() => connect(item)}
                    >
                      {busyId === item.slug ? <LoadingSpinner size={14} /> : <Link2 size={14} />}
                      Connect
                    </Button>
                  ) : null}
                  {item.canDisconnect ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === item.slug}
                      onClick={() => disconnect(item)}
                    >
                      {busyId === item.slug ? <LoadingSpinner size={14} /> : <Unplug size={14} />}
                      Disconnect
                    </Button>
                  ) : null}
                  {item.canSettings ? (
                    <Button size="sm" variant="secondary" onClick={() => openSettings(item)}>
                      <Settings size={14} />
                      Settings
                    </Button>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-5">
        <h2 className="mb-2 text-base font-semibold">{staffTitle}</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{staffDescription}</p>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'accountName', label: 'Account' },
              { key: 'platform', label: 'Platform' },
              {
                key: 'ownerType',
                label: 'Owner',
                render: (row) => row.ownerType || row.owner || '—',
              },
              {
                key: 'model31_social_source',
                label: 'Model 31 Source',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={row.model31_social_source ? 'MODEL 31 SOURCE: ON' : 'OFF'}
                    />
                    <Toggle
                      checked={Boolean(row.model31_social_source)}
                      disabled={togglingId === row.id}
                      onChange={(next) => void toggleSource(row, next)}
                    />
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
            ]}
            rows={accounts}
            pageSize={8}
            emptyTitle="No social accounts configured."
          />
        )}
      </Card>

      <Modal
        open={Boolean(settingsTarget)}
        onClose={() => !settingsLoading && setSettingsTarget(null)}
        title={settings?.title || `${settingsTarget?.name || 'Social'} Settings`}
      >
        {settingsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <>
            {settings?.account?.name ? (
              <p className="mb-3 text-sm">
                <span className="font-medium">{settings.account.name}</span>
                {settings.account.status ? (
                  <span className="ml-2 text-[var(--text-secondary)]">
                    · {settings.account.status}
                  </span>
                ) : null}
              </p>
            ) : null}
            <p className="text-sm text-[var(--text-secondary)]">
              {settings?.placeholder ||
                'Connect this account to manage inbox and posting settings.'}
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setSettingsTarget(null)}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
