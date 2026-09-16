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
import { useToast } from '../../hooks/useToast'
import { formatNumber } from '../../utils/table'
import salespersonSoldDealService from '../../services/api/salespersonSoldDealService'

const PAGE_SIZE = 10

function money(value) {
  return `$${formatNumber(value)}`
}

export default function SoldDealsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await salespersonSoldDealService.getSalespersonSoldDeals({
        page,
        limit: PAGE_SIZE,
      })
      setRows(result.items)
      setTotalItems(result.total)
      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      }
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load sold deals.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const openDeal = async (row) => {
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await salespersonSoldDealService.getSalespersonSoldDeal(row.id)
      if (full) setDetail(full)
    } catch (err) {
      showToast(err.message || 'Unable to load deal details.', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Sold Deals"
        description="Closed deals and associated commission records."
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              {
                key: 'salePrice',
                label: 'Deal Amount',
                render: (row) => money(row.salePrice),
              },
              { key: 'saleDate', label: 'Sale Date' },
              {
                key: 'commission',
                label: 'Commission',
                render: (row) => money(row.commission),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.commissionStatus} />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDeal(row)}>
                      View Deal
                    </Button>
                    {row.leadId && (
                      <Link to={`/salesperson/leads/${row.leadId}`}>
                        <Button size="sm" variant="ghost">
                          View Lead
                        </Button>
                      </Link>
                    )}
                    <Link to="/salesperson/commission">
                      <Button size="sm" variant="ghost">
                        View Commission
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            emptyTitle="No sold deals yet."
          />
        )}
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Sold Deal"
      >
        {detailLoading && !detail?.customerName ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={24} />
          </div>
        ) : detail ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{detail.customerName}</strong>
            </p>
            <p>{detail.vehicle}</p>
            <p>{detail.dealership}</p>
            <p>Sale date: {detail.saleDate}</p>
            <p>Deal amount: {money(detail.salePrice)}</p>
            <p>Commission: {money(detail.commission)}</p>
            {detail.paymentMethod && <p>Payment: {detail.paymentMethod}</p>}
            {detail.notes && <p className="text-[var(--text-secondary)]">{detail.notes}</p>}
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
