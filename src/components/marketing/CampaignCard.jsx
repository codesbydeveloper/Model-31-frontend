import { Link } from 'react-router-dom'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import PlatformBadge from './PlatformBadge'
import { formatNumber } from '../../utils/table'

export default function CampaignCard({ campaign }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{campaign.name}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {campaign.dealership} · {campaign.objective}
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(campaign.platforms || []).map((p) => (
          <PlatformBadge key={p} platform={p} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <p>
          <span className="text-[var(--text-muted)]">Budget</span>
          <br />
          <span className="font-medium">${formatNumber(campaign.budget)}</span>
        </p>
        <p>
          <span className="text-[var(--text-muted)]">Leads</span>
          <br />
          <span className="font-medium">{formatNumber(campaign.leads)}</span>
        </p>
      </div>
      <Link to={`/marketing/campaigns/${campaign.id}`} className="mt-4 inline-block">
        <Button size="sm">View Campaign</Button>
      </Link>
    </Card>
  )
}
