import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import ContentPreview from '../../components/marketing/ContentPreview'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import { useToast } from '../../hooks/useToast'
import {
  getApprovalQueue,
  getApprovalItem,
  approveApprovalItem,
  rejectApprovalItem,
  requestApprovalChanges,
} from '../../services/api/marketingApprovalService'

const PAGE_SIZE = 10

export default function ApprovalQueuePage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [review, setReview] = useState(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [changesOpen, setChangesOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getApprovalQueue({ page, limit: PAGE_SIZE })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load approval queue.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const openReview = async (row) => {
    setReview(row)
    try {
      const full = await getApprovalItem(row.id)
      if (full) setReview(full)
    } catch (err) {
      showToast(err.message || 'Unable to load approval details.', 'error')
    }
  }

  const closeOverlays = () => {
    setApproveOpen(false)
    setRejectOpen(false)
    setChangesOpen(false)
    setReview(null)
    setReason('')
  }

  const target = review

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Approval Queue"
        description="Review sales-script words before they go to the salesperson. Nothing is published from here."
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Content' },
              { key: 'contentType', label: 'Type' },
              { key: 'dealership', label: 'Dealership' },
              {
                key: 'platform',
                label: 'Platform',
                render: (row) => <PlatformBadge platform={row.platform} />,
              },
              { key: 'createdBy', label: 'Created By' },
              { key: 'createdDate', label: 'Created' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" onClick={() => void openReview(row)}>
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setReview(row)
                        setApproveOpen(true)
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReview(row)
                        setReason('')
                        setRejectOpen(true)
                      }}
                    >
                      Reject
                    </Button>
                    <Link to={`/marketing/content/${row.id}?edit=1&from=approval`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            totalItems={totalItems}
            showPagination
            emptyTitle="No content awaiting approval."
          />
        )}
      </Card>

      <Modal
        open={Boolean(review) && !approveOpen && !rejectOpen && !changesOpen}
        onClose={() => setReview(null)}
        title="Review Content"
        className="max-w-3xl"
      >
        {review && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="text-lg font-semibold">{review.title}</p>
              <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{review.body}</p>
              <p>Platform: {review.platform}</p>
              <p>Dealership: {review.dealership}</p>
              <p>Campaign: {review.campaign || '—'}</p>
              <p>Audience: {review.audience}</p>
              <p>Tone: {review.tone}</p>
              <p>Language: {review.language}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => setApproveOpen(true)}>Approve</Button>
                <Button variant="secondary" onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReason('')
                    setChangesOpen(true)
                  }}
                >
                  Request Changes
                </Button>
              </div>
            </div>
            <ContentPreview
              platform={review.platform}
              title={review.title}
              body={review.body}
              hashtags={review.hashtags}
              imageUrl={review.imageUrl}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={async () => {
          if (!target) return
          setBusy(true)
          try {
            await approveApprovalItem(target.id)
            closeOverlays()
            showToast('Content approved.')
            await load()
          } catch (err) {
            showToast(err.message || 'Unable to approve content.', 'error')
          } finally {
            setBusy(false)
          }
        }}
        title="Approve content?"
        message="Approve this content for publishing?"
        confirmLabel="Approve"
        loading={busy}
      />

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Content">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!target || !reason.trim()) return
            setBusy(true)
            try {
              await rejectApprovalItem(target.id, reason.trim())
              closeOverlays()
              showToast('Content rejected.')
              await load()
            } catch (err) {
              showToast(err.message || 'Unable to reject content.', 'error')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="mb-1.5 block text-sm font-medium">Rejection Reason</label>
          <textarea
            className="input-field min-h-24"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Needs stronger CTA"
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !reason.trim()}>
              {busy ? <LoadingSpinner size={16} /> : 'Reject'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={changesOpen} onClose={() => setChangesOpen(false)} title="Request Changes">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!target || !reason.trim()) return
            setBusy(true)
            try {
              await requestApprovalChanges(target.id, reason.trim())
              closeOverlays()
              showToast('Change request sent. Content moved to draft.')
              await load()
            } catch (err) {
              showToast(err.message || 'Unable to request changes.', 'error')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="mb-1.5 block text-sm font-medium">Requested Changes</label>
          <textarea
            className="input-field min-h-24"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please soften tone"
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setChangesOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !reason.trim()}>
              {busy ? <LoadingSpinner size={16} /> : 'Save Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
