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
import marketingContentService from '../../services/mock/marketingContentService'

export default function ApprovalQueuePage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
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
      setRows(await marketingContentService.getApprovalQueue())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const target = review

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Approval Queue"
        description="Review and approve marketing content before publishing."
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
                    <Button size="sm" onClick={() => setReview(row)}>
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
                    <Link to={`/marketing/content/${row.id}?edit=1`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={rows}
            pageSize={8}
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
                <Button
                  onClick={() => setApproveOpen(true)}
                >
                  Approve
                </Button>
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
            await marketingContentService.approveContent(target.id)
            setApproveOpen(false)
            setReview(null)
            showToast('Content approved successfully.')
            await load()
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
              await marketingContentService.rejectContent(target.id, reason.trim())
              setRejectOpen(false)
              setReview(null)
              showToast('Content rejected.')
              await load()
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
            placeholder="Please update the offer details."
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !reason.trim()}>
              Reject
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
              await marketingContentService.requestChanges(target.id, reason.trim())
              setChangesOpen(false)
              setReview(null)
              showToast('Change request saved.')
              await load()
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
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setChangesOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !reason.trim()}>
              Save Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
