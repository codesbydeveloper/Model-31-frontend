import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import ContentPreview from '../../components/marketing/ContentPreview'
import { useToast } from '../../hooks/useToast'
import dealershipContentService from '../../services/api/dealershipContentService'

const PAGE_SIZE = 9

function visiblePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

export default function DealershipContentPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dealershipContentService.getDealershipAiContent({
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setTotal(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotal(0)
      showToast(err.message || 'Unable to load AI content.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const openItem = async (item) => {
    setViewLoading(true)
    setViewing(item)
    try {
      const detail = await dealershipContentService.getDealershipAiContentById(item.id)
      setViewing({
        ...item,
        ...(detail || {}),
        title:
          detail?.title && detail.title !== 'Untitled' ? detail.title : item.title,
        body: detail?.body || item.body,
        platform: detail?.platform || item.platform,
        status: detail?.status || item.status,
      })
    } catch (err) {
      showToast(err.message || 'Unable to load content.', 'error')
    } finally {
      setViewLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min((page - 1) * PAGE_SIZE + rows.length, total)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="AI Content"
        description="Review AI-generated marketing content for this dealership."
      />
      {loading ? (
        <Card>
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            title="No content yet"
            description="Marketing content for this dealership will appear here."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => {
            const excerpt = item.body && item.body !== item.title ? item.body : ''
            return (
              <Card
                key={item.id}
                padding={false}
                className="flex h-full flex-col overflow-hidden"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <PlatformBadge platform={item.platform} />
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 line-clamp-3 text-base font-semibold leading-snug text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  {excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {excerpt}
                    </p>
                  ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border-default)] px-5 py-3">
                  <p className="min-w-0 truncate text-xs text-[var(--text-muted)]">
                    {item.createdAt || '—'}
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => openItem(item)}>
                    View
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      {!loading && total > PAGE_SIZE && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            {visiblePages(page, totalPages).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPage(pageNumber)}
                aria-current={pageNumber === page ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || 'AI Content'}
        className="max-w-2xl"
      >
        {viewLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : viewing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <PlatformBadge platform={viewing.platform} />
              <StatusBadge status={viewing.status} />
              {viewing.type ? <StatusBadge status={viewing.type} /> : null}
            </div>

            <ContentPreview
              platform={viewing.platform || 'Instagram'}
              title={viewing.title}
              body={viewing.body}
              cta={viewing.cta}
              hashtags={viewing.hashtags}
              imageUrl={viewing.imageUrl}
            />

            {viewing.dealership ||
            viewing.campaign ||
            viewing.vehicle ||
            viewing.offer ||
            viewing.tone ||
            viewing.language ||
            viewing.audience ||
            viewing.createdBy ||
            viewing.createdAt ||
            viewing.scheduledAt ||
            viewing.videoDuration ? (
              <dl className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-3">
                <DetailRow label="Dealership" value={viewing.dealership} />
                <DetailRow label="Campaign" value={viewing.campaign} />
                <DetailRow label="Vehicle" value={viewing.vehicle} />
                <DetailRow label="Offer" value={viewing.offer} />
                <DetailRow label="Tone" value={viewing.tone} />
                <DetailRow label="Language" value={viewing.language} />
                <DetailRow label="Audience" value={viewing.audience} />
                <DetailRow label="Created by" value={viewing.createdBy} />
                <DetailRow label="Created" value={viewing.createdAt} />
                <DetailRow label="Scheduled" value={viewing.scheduledAt} />
                <DetailRow label="Video duration" value={viewing.videoDuration} />
              </dl>
            ) : null}

            {viewing.brief ? (
              <div>
                <p className="text-sm font-medium">Brief</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                  {viewing.brief}
                </p>
              </div>
            ) : null}

            {viewing.scenes?.length ? (
              <div>
                <p className="text-sm font-medium">Scenes</p>
                <ol className="mt-1 space-y-1 text-sm text-[var(--text-secondary)]">
                  {viewing.scenes.map((scene) => (
                    <li key={`${scene.scene}-${scene.text}`}>
                      Scene {scene.scene}: {scene.text}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
