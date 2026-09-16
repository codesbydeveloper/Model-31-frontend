import PlatformBadge from './PlatformBadge'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import Card from '../common/Card'

export default function ContentCard({
  item,
  onView,
  onEdit,
  onDuplicate,
  onSubmit,
  onDelete,
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{item.title}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {item.contentType} · {item.dealership}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <PlatformBadge platform={item.platform} />
        <span className="text-xs text-[var(--text-muted)]">{item.createdDate}</span>
      </div>
      <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">{item.body}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => onView?.(item)}>
          View
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onEdit?.(item)}>
          Edit
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onDuplicate?.(item)}>
          Duplicate
        </Button>
        {(item.status === 'DRAFT' || item.status === 'REJECTED') && (
          <Button size="sm" onClick={() => onSubmit?.(item)}>
            Send to Salesperson
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onDelete?.(item)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
