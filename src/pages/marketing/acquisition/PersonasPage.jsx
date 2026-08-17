import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import StatusBadge from '../../../components/common/StatusBadge'
import SearchInput from '../../../components/common/SearchInput'
import Select from '../../../components/common/Select'
import Modal from '../../../components/common/Modal'
import Input from '../../../components/common/Input'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/ui/EmptyState'
import { useToast } from '../../../hooks/useToast'
import { formatNumber } from '../../../utils/table'
import {
  PERSONA_TONES,
  PERSONA_LANGUAGES,
} from '../../../data/personas'
import { SOCIAL_PLATFORMS } from '../../../data/marketingContent'
import personaService from '../../../services/mock/personaService'

const EMPTY_FORM = {
  name: '',
  description: '',
  targetAudience: '',
  tone: PERSONA_TONES[1] || 'Friendly',
  language: PERSONA_LANGUAGES[0],
  primaryPlatform: 'Instagram',
  status: 'ACTIVE',
}

export default function PersonasPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await personaService.getPersonas())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.targetAudience || r.audience || '').toLowerCase().includes(q),
      )
    }
    if (status !== 'all') list = list.filter((r) => r.status === status)
    return list
  }, [rows, search, status])

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await personaService.createPersona(form)
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      showToast('Persona created.')
      await load()
      navigate(`/marketing/acquisition/personas/${created.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <PageHeader
        title="Personas"
        description="Build acquisition personas and track engagement-to-lead performance."
        actions={
          <Button
            onClick={() => {
              setForm(EMPTY_FORM)
              setCreateOpen(true)
            }}
          >
            <Plus size={16} />
            Create Persona
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personas..."
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'ACTIVE', label: 'ACTIVE' },
              { value: 'PAUSED', label: 'PAUSED' },
              { value: 'DRAFT', label: 'DRAFT' },
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No personas found."
            description="Create a persona to start targeting acquisition audiences."
            actionLabel="Create Persona"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((persona) => (
              <Link
                key={persona.id}
                to={`/marketing/acquisition/personas/${persona.id}`}
                className="block"
              >
                <Card className="h-full transition hover:border-[var(--brand-accent)]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold">{persona.name}</h3>
                    <StatusBadge status={persona.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {persona.description}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {persona.targetAudience || persona.audience}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-[var(--text-muted)]">Engagement</dt>
                      <dd className="font-semibold">{formatNumber(persona.engagement)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-muted)]">Leads</dt>
                      <dd className="font-semibold">{formatNumber(persona.leads)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-muted)]">Appointments</dt>
                      <dd className="font-semibold">{formatNumber(persona.appointments)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-muted)]">Sold</dt>
                      <dd className="font-semibold">{formatNumber(persona.sold)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    {persona.primaryPlatform} · {persona.tone} · {persona.language}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Persona"
        className="max-w-lg"
      >
        <form className="grid gap-3" onSubmit={onCreate}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="input-field min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            required
          />
          <Select
            label="Tone"
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
            options={PERSONA_TONES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Language"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            options={PERSONA_LANGUAGES.map((l) => ({ value: l, label: l }))}
          />
          <Select
            label="Primary Platform"
            value={form.primaryPlatform}
            onChange={(e) => setForm({ ...form, primaryPlatform: e.target.value })}
            options={SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp').map((p) => ({
              value: p,
              label: p,
            }))}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'ACTIVE', label: 'ACTIVE' },
              { value: 'DRAFT', label: 'DRAFT' },
              { value: 'PAUSED', label: 'PAUSED' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? <LoadingSpinner size={16} /> : 'Save Persona'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
