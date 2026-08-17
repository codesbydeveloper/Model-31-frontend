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
import integrationService from '../../services/mock/integrationService'
import socialService from '../../services/mock/socialService'
import DataTable from '../../components/common/DataTable'
import Toggle from '../../components/common/Toggle'

const ICONS = {
  Facebook: Share2,
  Instagram: Camera,
  WhatsApp: MessageCircle,
  TikTok: Music2,
  YouTube: Video,
  X: AtSign,
  Whatnot: ShoppingBag,
}

export default function SocialIntegrationsPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [settingsTarget, setSettingsTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [platforms, socialAccounts] = await Promise.all([
        integrationService.getSocialIntegrations(),
        socialService.getSocialAccounts(),
      ])
      setItems(platforms)
      setAccounts(socialAccounts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const connect = async (id) => {
    setBusyId(id)
    try {
      await integrationService.connectSocial(id)
      showToast('Social platform connected successfully.')
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const disconnect = async (id) => {
    setBusyId(id)
    try {
      await integrationService.disconnectSocial(id)
      showToast('Social platform disconnected.')
      await load()
    } finally {
      setBusyId(null)
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.name] || MessageCircle
            return (
              <Card key={item.id}>
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
                  {item.connectionStatus !== 'Connected' ? (
                    <Button
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => connect(item.id)}
                    >
                      {busyId === item.id ? (
                        <LoadingSpinner size={14} />
                      ) : (
                        <Link2 size={14} />
                      )}
                      Connect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === item.id}
                      onClick={() => disconnect(item.id)}
                    >
                      <Unplug size={14} />
                      Disconnect
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSettingsTarget(item)}
                  >
                    <Settings size={14} />
                    Settings
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-5">
        <h2 className="mb-2 text-base font-semibold">Authorized Staff Social Accounts</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Engagement from accounts with Model 31 Source ON is treated as a Model 31 source.
        </p>
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
                      onChange={async (next) => {
                        await socialService.updateSocialSettings(row.id, {
                          model31_social_source: next,
                        })
                        showToast('Social source setting updated.')
                        await load()
                      }}
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
        onClose={() => setSettingsTarget(null)}
        title={`${settingsTarget?.name || 'Social'} Settings`}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          OAuth and publishing settings will be connected in a later step. This
          modal is a simulated placeholder for {settingsTarget?.name}.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setSettingsTarget(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}
