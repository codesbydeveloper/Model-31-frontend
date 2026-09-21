import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ROLES } from '../../data/roles'
import { formatMoney } from '../../data/demoServiceRoles'
import { getServiceManagerJob } from '../../services/api/serviceManagerService'
import { getServiceAdvisorJob } from '../../services/api/serviceAdvisorService'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  )
}

export default function ServiceJobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const isManager = user?.role === ROLES.SERVICE_MANAGER
  const backPath = isManager ? '/service-manager/jobs' : '/service-advisor/jobs'
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (isManager) {
        setJob(await getServiceManagerJob(id))
      } else {
        setJob(await getServiceAdvisorJob(id))
      }
    } catch (err) {
      setJob(null)
      showToast(err.message || 'Unable to load repair order.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, isManager, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!job) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Repair order not found</h1>
        <Link to={backPath} className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to={backPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={job.roNumber || job.id}
        description={`${job.customerName} · ${job.vehicle}`}
        actions={<StatusBadge status={job.statusLabel || job.status} />}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Customer</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Name" value={job.customerName} />
            <Row label="Phone" value={job.phone} />
            <Row label="Email" value={job.email} />
            <Row label="Appointment" value={job.appointmentAt} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Vehicle & job</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Vehicle" value={job.vehicle} />
            <Row label="VIN" value={job.vin} />
            <Row label="Mileage" value={job.mileage ? job.mileage.toLocaleString() : ''} />
            <Row label="Concern" value={job.concern} />
            <Row label="Advisor" value={job.advisorName} />
            <Row label="Technician" value={job.technicianName} />
            <Row label="Hours" value={job.hours} />
            <Row label="Amount" value={formatMoney(job.amount)} />
            <Row label="Delay reason" value={job.delayReason} />
            <Row label="CSI" value={job.csi} />
          </dl>
        </Card>
      </div>
    </div>
  )
}
