import StatusBadge from '../common/StatusBadge'
import { cn } from '../../utils/cn'

const COLORS = {
  Facebook: 'bg-[#1877f2]/15 text-[#1877f2]',
  Instagram: 'bg-[#e1306c]/15 text-[#c13584]',
  TikTok: 'bg-black/10 text-black',
  YouTube: 'bg-[#ff0000]/15 text-[#cc0000]',
  X: 'bg-black/10 text-black',
  Whatnot: 'bg-[#7c3aed]/15 text-[#6d28d9]',
  WhatsApp: 'bg-[#25d366]/15 text-[#128c7e]',
}

export default function PlatformBadge({ platform, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        COLORS[platform] || 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
        className,
      )}
    >
      {platform}
    </span>
  )
}

export function ApprovalStatus({ status }) {
  return <StatusBadge status={status} />
}
