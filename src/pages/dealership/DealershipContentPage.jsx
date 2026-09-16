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
import { useToast } from '../../hooks/useToast'
import dealershipContentService from '../../services/api/dealershipContentService'

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
      setViewing(detail || item)
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
        className="max-w-xl"
      >
        {viewLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <PlatformBadge platform={viewing?.platform} />
              <StatusBadge status={viewing?.status} />
            </div>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {viewing?.body || 'No copy available for this item.'}
            </p>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
