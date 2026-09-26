import { useCallback, useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await dealershipContentService.getDealershipAiContent())
    } catch (err) {
      setRows([])
      showToast(err.message || 'Unable to load AI content.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

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

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="AI Content"
        description="Review AI-generated marketing content for this dealership."
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No content yet"
            description="Marketing content for this dealership will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <PlatformBadge platform={item.platform} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openItem(item)}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

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
