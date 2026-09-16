import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import { formatNumber, formatPercent } from '../../utils/table'
import PlatformBadge from './PlatformBadge'

export default function SocialPlatformCard({ account, onConnect, onDisconnect, onSettings }) {
  const canConnect = account.canConnect ?? account.status !== 'CONNECTED'
  const canSettings = account.canSettings ?? account.status === 'CONNECTED'
  const canDisconnect = account.canDisconnect ?? account.status === 'CONNECTED'
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <PlatformBadge platform={account.platform} />
          <p className="mt-2 font-semibold">{account.accountName || 'Not connected'}</p>
        </div>
        <StatusBadge status={account.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[var(--text-muted)]">Owner</dt>
          <dd className="font-medium">{account.owner || account.ownerType || '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Model 31 Source</dt>
          <dd className="font-medium">
            {account.model31_social_source ? 'MODEL 31 SOURCE: ON' : 'MODEL 31 SOURCE: OFF'}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Last Sync</dt>
          <dd className="font-medium">{account.lastSync || '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Posts</dt>
          <dd className="font-medium">{formatNumber(account.posts)}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Followers</dt>
          <dd className="font-medium">{formatNumber(account.followers)}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Reach</dt>
          <dd className="font-medium">{formatNumber(account.reach)}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Leads</dt>
          <dd className="font-medium">{formatNumber(account.leads)}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Engagement</dt>
          <dd className="font-medium">{formatPercent(account.engagement)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {canConnect && (
          <Button size="sm" onClick={() => onConnect?.(account)}>
            Connect
          </Button>
        )}
        {canSettings && (
          <Button size="sm" variant="secondary" onClick={() => onSettings?.(account)}>
            Settings
          </Button>
        )}
        {canDisconnect && (
          <Button size="sm" variant="ghost" onClick={() => onDisconnect?.(account)}>
            Disconnect
          </Button>
        )}
      </div>
    </Card>
  )
}
