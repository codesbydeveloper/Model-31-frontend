import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import StatCard from '../../../components/common/StatCard'
import StatusBadge from '../../../components/common/StatusBadge'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { formatNumber } from '../../../utils/table'
import { useToast } from '../../../hooks/useToast'
import { getMarketingPersona } from '../../../services/api/marketingPersonaService'

export default function PersonaDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [persona, setPersona] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPersona(await getMarketingPersona(id))
    } catch (err) {
      setPersona(null)
      showToast(err.message || 'Unable to load persona.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

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

  if (!persona) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Persona not found</h1>
        <Link to="/marketing/acquisition/personas" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/acquisition/personas">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={persona.name}
        description={persona.description}
        actions={<StatusBadge status={persona.status} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Followers" value={formatNumber(persona.followers)} />
        <StatCard label="Engagement" value={formatNumber(persona.engagement)} />
        <StatCard label="Leads" value={formatNumber(persona.leads)} />
        <StatCard label="Sold" value={formatNumber(persona.sold)} />
        <StatCard label="DM Interactions" value={formatNumber(persona.dmInteractions)} />
        <StatCard label="Story Interactions" value={formatNumber(persona.storyInteractions)} />
        <StatCard label="Returning Visitors" value={formatNumber(persona.returningVisitors)} />
        <StatCard label="Intent Signals" value={formatNumber(persona.intentSignals)} />
      </div>

      <Card className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Persona Details</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Audience" value={persona.targetAudience || persona.audience} />
          <Info label="Tone" value={persona.tone} />
          <Info label="Language" value={persona.language} />
          <Info label="Primary Platform" value={persona.primaryPlatform} />
          <Info
            label="Platforms"
            value={(persona.platforms || []).join(', ') || '—'}
          />
          <Info label="Appointments" value={formatNumber(persona.appointments)} />
        </dl>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Engagement Trend" data={persona.chartEngagement} dataKey="value" name="Engagement" stroke="#0f2b46" />
        <ChartCard title="Leads Trend" data={persona.chartLeads} dataKey="value" name="Leads" stroke="#1a7a4c" />
        <ChartCard title="Conversion Trend" data={persona.chartConversion} dataKey="value" name="Conversion" stroke="#1a6b8a" />
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}

function ChartCard({ title, data, dataKey, name, stroke }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []}>
            <CartesianGrid stroke="#e2e7ed" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} name={name} stroke={stroke} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
