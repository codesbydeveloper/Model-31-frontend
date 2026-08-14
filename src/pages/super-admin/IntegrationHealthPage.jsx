import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatNumber } from '../../utils/table'
import { useToast } from '../../hooks/useToast'
import integrationHealthService from '../../services/mock/integrationHealthService'

export default function IntegrationHealthPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await integrationHealthService.getIntegrationHealth())
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
        title="Integration Health"
        description="Monitor the health of platform integrations and supporting services."
        actions={
          <Button
            disabled={checking}
            onClick={async () => {
              setChecking(true)
              try {
                setRows(await integrationHealthService.runHealthCheck())
                showToast('Health check completed.')
              } finally {
                setChecking(false)
              }
            }}
          >
            {checking ? (
              <>
                <LoadingSpinner size={16} />
                Running…
              </>
            ) : (
              'Run Health Check'
            )}
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{item.name}</h2>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Last Check</dt>
                  <dd className="font-medium">{item.lastCheck}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Latency</dt>
                  <dd className="font-medium">
                    {item.latencyMs ? `${item.latencyMs} ms` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">Errors</dt>
                  <dd className="font-medium">{formatNumber(item.errors)}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
