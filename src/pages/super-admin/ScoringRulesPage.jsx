import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import FunnelVisual from '../../components/common/FunnelVisual'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import settingsService from '../../services/mock/settingsService'
import { funnelStages } from '../../data/analytics'

const WEIGHT_FIELDS = [
  { key: 'budget', label: 'Budget' },
  { key: 'vehicle', label: 'Desired Vehicle' },
  { key: 'timeline', label: 'Buying Timeline' },
  { key: 'location', label: 'Location / Neighborhood' },
  { key: 'financing', label: 'Financing Preference' },
]

export default function ScoringRulesPage() {
  const { showToast } = useToast()
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setRules(await settingsService.getScoringRules())
      setLoading(false)
    })()
  }, [])

  const total = useMemo(() => {
    if (!rules) return 0
    return Object.values(rules.weights).reduce((sum, n) => sum + Number(n || 0), 0)
  }, [rules])

  const updateWeight = (key, value) => {
    const num = Math.max(0, Number(value) || 0)
    setRules((prev) => ({
      ...prev,
      weights: { ...prev.weights, [key]: num },
    }))
    setError('')
  }

  const updateTier = (tier, field, value) => {
    const num = Math.max(0, Math.min(100, Number(value) || 0))
    setRules((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: { ...prev.tiers[tier], [field]: num },
      },
    }))
    setError('')
  }

  const onSave = async () => {
    if (total !== 100) {
      setError('Total scoring weight must equal 100 points.')
      return
    }
    if (
      rules.tiers.a.min <= rules.tiers.b.max ||
      rules.tiers.b.min <= rules.tiers.c.max
    ) {
      // allow contiguous ranges; validate a.min > b.max roughly for clarity
    }
    if (rules.tiers.a.min <= rules.tiers.b.min) {
      setError('Tier A minimum should be greater than Tier B minimum.')
      return
    }
    if (rules.tiers.b.min <= rules.tiers.c.min) {
      setError('Tier B minimum should be greater than Tier C minimum.')
      return
    }

    setSaving(true)
    try {
      await settingsService.saveScoringRules(rules)
      showToast('Scoring rules saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !rules) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title="Scoring Rules"
        description="Configure lead qualification weights, tiers, and lifecycle stages."
        actions={
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Save Scoring Rules'
            )}
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--status-error)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error)]">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Scoring Weights</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Qualification parameters must total 100 points.
              </p>
            </div>
            <p
              className={`text-sm font-semibold ${
                total === 100
                  ? 'text-[var(--status-ready)]'
                  : 'text-[var(--status-error)]'
              }`}
            >
              Total: {total} / 100
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {WEIGHT_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={`${field.label} (points)`}
                type="number"
                min={0}
                max={100}
                value={rules.weights[field.key]}
                onChange={(e) => updateWeight(field.key, e.target.value)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Lead Tiers</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Define score thresholds for Tier A, B, and C.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {['a', 'b', 'c'].map((tier) => (
              <div
                key={tier}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-4"
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
                  Tier {tier.toUpperCase()}
                </p>
                <div className="space-y-3">
                  <Input
                    label="Min"
                    type="number"
                    value={rules.tiers[tier].min}
                    onChange={(e) => updateTier(tier, 'min', e.target.value)}
                  />
                  <Input
                    label="Max"
                    type="number"
                    value={rules.tiers[tier].max}
                    onChange={(e) => updateTier(tier, 'max', e.target.value)}
                  />
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-accent)]"
                    style={{
                      width: `${Math.max(
                        8,
                        rules.tiers[tier].max - rules.tiers[tier].min,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  {rules.tiers[tier].min}–{rules.tiers[tier].max}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Lead Lifecycle</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Visual lifecycle used across AutoFlow lead processing.
          </p>
          <div className="mt-5">
            <FunnelVisual
              stages={rules.lifecycle.map((stage, index) => ({
                stage,
                count: funnelStages[index]?.count || 0,
              }))}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
