import { useCallback, useEffect, useState } from 'react'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import PageHeader from '../components/layout/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ROLES } from '../data/roles'
import salespersonService from '../services/mock/salespersonService'

export default function ProfilePage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [onlineStatus, setOnlineStatus] = useState(null)
  const [updating, setUpdating] = useState(false)

  const isSalesperson = user?.role === ROLES.SALESPERSON

  const loadStatus = useCallback(async () => {
    if (!isSalesperson) return
    const person = await salespersonService.getCurrentSalesperson()
    setOnlineStatus(person.status)
  }, [isSalesperson])

  useEffect(() => {
    const t = window.setTimeout(() => void loadStatus(), 0)
    return () => window.clearTimeout(t)
  }, [loadStatus])

  const toggle = async () => {
    setUpdating(true)
    try {
      const next = onlineStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
      const updated = await salespersonService.updateSalespersonStatus(
        'sp_001',
        next,
      )
      setOnlineStatus(updated.status)
      showToast(
        next === 'ONLINE'
          ? 'You are available for new leads.'
          : 'You are currently offline.',
      )
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 md:pb-0">
      <Breadcrumbs />
      <PageHeader
        title="Profile"
        description="Your account details for this AutoFlow demo session."
      />
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-lg font-semibold text-[var(--brand-accent)]">
            {user?.avatar}
          </span>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <Badge variant="neutral" className="mt-1">
              {user?.role}
            </Badge>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Email
            </dt>
            <dd className="mt-1 text-sm text-[var(--text-primary)]">
              {user?.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Dealership
            </dt>
            <dd className="mt-1 text-sm text-[var(--text-primary)]">
              {user?.dealership}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Account Status
            </dt>
            <dd className="mt-1 text-sm capitalize text-[var(--text-primary)]">
              {user?.status}
            </dd>
          </div>
          {isSalesperson && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Online Status
              </dt>
              <dd className="mt-1">
                {onlineStatus ? (
                  <StatusBadge status={onlineStatus} />
                ) : (
                  <LoadingSpinner size={16} />
                )}
              </dd>
            </div>
          )}
        </dl>

        {isSalesperson && (
          <div className="mt-6">
            <Button onClick={toggle} disabled={updating || !onlineStatus}>
              {updating ? (
                <LoadingSpinner size={16} />
              ) : onlineStatus === 'ONLINE' ? (
                'GO OFFLINE'
              ) : (
                'GO ONLINE'
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
