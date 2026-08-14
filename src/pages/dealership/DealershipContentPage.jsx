import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import PlatformBadge from '../../components/marketing/PlatformBadge'
import marketingContentService from '../../services/mock/marketingContentService'

export default function DealershipContentPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await marketingContentService.getContent()
      setRows(list.filter((c) => c.dealership === 'Miami Luxury Motors').slice(0, 12))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

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
                <Link to="/marketing/content">
                  <Button size="sm" variant="secondary">
                    Open Library
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
