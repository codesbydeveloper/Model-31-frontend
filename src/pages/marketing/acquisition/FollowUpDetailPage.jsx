import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import StatCard from '../../../components/common/StatCard'
import StatusBadge from '../../../components/common/StatusBadge'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import DataTable from '../../../components/common/DataTable'
import { useToast } from '../../../hooks/useToast'
import { formatNumber, formatPercent } from '../../../utils/table'
import {
  getFollowUp,
  pauseFollowUp,
  resumeFollowUp,
} from '../../../services/api/marketingFollowUpService'

export default function FollowUpDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [sequence, setSequence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSequence(await getFollowUp(id))
    } catch (err) {
      setSequence(null)
      showToast(err.message || 'Unable to load follow-up sequence.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const togglePause = async () => {
    if (!sequence) return
    setToggling(true)
    try {
      if (sequence.status === 'PAUSED') {
        await resumeFollowUp(sequence.id)
        showToast('Sequence resumed.')
      } else {
        await pauseFollowUp(sequence.id)
        showToast('Sequence paused.')
      }
      await load()
    } catch (err) {
      showToast(err.message || 'Unable to update sequence.', 'error')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!sequence) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Follow-up sequence not found</h1>
        <Link to="/marketing/acquisition/follow-ups" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  const steps = sequence.steps || []

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/acquisition/follow-ups">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={sequence.name}
        description={sequence.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={sequence.status} />
            {(sequence.status === 'ACTIVE' || sequence.status === 'PAUSED') && (
              <Button size="sm" onClick={togglePause} disabled={toggling}>
                {toggling ? (
                  <LoadingSpinner size={16} />
                ) : sequence.status === 'PAUSED' ? (
                  'Resume'
                ) : (
                  'Pause'
                )}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Leads" value={formatNumber(sequence.activeLeads)} />
        <StatCard label="Completed" value={formatNumber(sequence.completed)} />
        <StatCard label="Conversion" value={formatPercent(sequence.conversion)} />
        <StatCard label="Steps" value={formatNumber(sequence.stepCount || steps.length)} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-1 text-base font-semibold">Sequence Builder</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {sequence.trigger} · {sequence.targetAudience || sequence.audience}
        </p>
        <div className="flex flex-col gap-3 overflow-x-auto lg:flex-row lg:items-stretch">
          {steps.map((step, index) => (
            <div key={step.id || index} className="flex items-stretch gap-3 lg:min-w-[180px]">
              <div className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)]/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-accent)]">
                  Day {step.day}
                </p>
                <p className="mt-2 text-sm font-semibold">{step.channel}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{step.message}</p>
                <div className="mt-2">
                  <StatusBadge status={step.status} />
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden items-center text-[var(--text-muted)] lg:flex">
                  <ArrowRight size={18} />
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="flex justify-center text-[var(--text-muted)] lg:hidden">↓</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Steps</h2>
        <DataTable
          columns={[
            {
              key: 'day',
              label: 'Day',
              render: (row) => `Day ${row.day}`,
            },
            { key: 'channel', label: 'Channel' },
            { key: 'message', label: 'Message' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
          rows={steps}
          pageSize={10}
          emptyTitle="No steps configured."
        />
      </Card>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Activity</h2>
        {(sequence.activity || []).length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {sequence.activity.map((event) => (
              <li
                key={event.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{event.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{event.time}</p>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{event.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
