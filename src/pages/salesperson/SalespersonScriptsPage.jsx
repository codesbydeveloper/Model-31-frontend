import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { SCRIPT_STATUSES } from '../../data/salesScripts'
import { getSalespersonScripts } from '../../services/api/salespersonScriptService'

const PAGE_SIZE = 10

export default function SalespersonScriptsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getSalespersonScripts({
        page,
        limit: PAGE_SIZE,
        status,
      })
      setRows(result.items)
      setTotalItems(result.total)
    } catch (err) {
      setRows([])
      setTotalItems(0)
      showToast(err.message || 'Unable to load scripts.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, status, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Sales Scripts"
        description="Model 31 sends words only. Approve the script, then copy it into CapCut or Instagram yourself. No video is generated here."
      />
      <Card>
        <div className="mb-4 max-w-xs">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'ALL', label: 'All statuses' },
              ...SCRIPT_STATUSES.map((item) => ({ value: item, label: item })),
            ]}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'customerName', label: 'Customer' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'platform', label: 'Platform' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <StatusBadge status={row.status} />,
              },
              { key: 'createdLabel', label: 'Created' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Link to={`/salesperson/scripts/${row.id}`}>
                    <Button size="sm">Open</Button>
                  </Link>
                ),
              },
            ]}
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            showPagination
            onPageChange={setPage}
            emptyTitle="No scripts yet."
            emptyDescription="Scripts appear after a buyer is detected and qualified."
          />
        )}
      </Card>
    </div>
  )
}
