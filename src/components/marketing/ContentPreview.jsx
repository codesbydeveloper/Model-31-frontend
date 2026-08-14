import Card from '../common/Card'
import PlatformBadge from './PlatformBadge'
import { cn } from '../../utils/cn'

export default function ContentPreview({
  platform = 'Instagram',
  title,
  body,
  hashtags = [],
  imageUrl,
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{platform} Preview</p>
          <PlatformBadge platform={platform} />
        </div>
      </div>
      <div
        className={cn(
          'p-4',
          platform === 'TikTok' && 'bg-zinc-950 text-white',
          platform === 'X' && 'bg-white',
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-accent)] text-xs font-bold text-white">
            M31
          </div>
          <div>
            <p className="text-sm font-semibold">Model 31 Dealership</p>
            <p
              className={cn(
                'text-xs',
                platform === 'TikTok' ? 'text-zinc-400' : 'text-[var(--text-muted)]',
              )}
            >
              Sponsored · Just now
            </p>
          </div>
        </div>
        <p className="mb-2 text-sm font-semibold">{title || 'Untitled'}</p>
        <p
          className={cn(
            'whitespace-pre-wrap text-sm',
            platform === 'TikTok' ? 'text-zinc-200' : 'text-[var(--text-secondary)]',
          )}
        >
          {body || 'Generated content will appear here.'}
        </p>
        {hashtags?.length > 0 && (
          <p className="mt-2 text-sm text-[var(--brand-accent)]">
            {hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ')}
          </p>
        )}
        {(imageUrl || platform === 'Instagram' || platform === 'Facebook') && (
          <div className="mt-3 flex h-40 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-muted)] text-sm text-[var(--text-muted)]">
            {imageUrl === 'mock' ? 'Mock generated image' : 'Media preview placeholder'}
          </div>
        )}
      </div>
    </Card>
  )
}
