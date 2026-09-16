import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import FunnelVisual from '../../components/common/FunnelVisual'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import scoringRulesService from '../../services/api/scoringRulesService'
import { funnelStages } from '../../data/analytics'

const WEIGHT_FIELDS = [
  { key: 'budget', label: 'Budget' },
  { key: 'desiredVehicle', label: 'Desired Vehicle' },
  { key: 'buyingTimeline', label: 'Buying Timeline' },
  { key: 'location', label: 'Location / Neighborhood' },
  { key: 'financingPreference', label: 'Financing Preference' },
]

const TIER_FIELDS = [
  { key: 'tierA', label: 'A' },
  { key: 'tierB', label: 'B' },
  { key: 'tierC', label: 'C' },
]

export default function ScoringRulesPage() {
  const { showToast } = useToast()
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await scoringRulesService.getScoringRules()
        if (active) setRules(data)
      } catch (err) {
        if (active) {
          setRules(null)
          setError(err.message || 'Unable to load scoring rules.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
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
    if (rules.tiers.tierA.min <= rules.tiers.tierB.min) {
      setError('Tier A minimum should be greater than Tier B minimum.')
      return
    }
    if (rules.tiers.tierB.min <= rules.tiers.tierC.min) {
      setError('Tier B minimum should be greater than Tier C minimum.')
      return
    }

    setSaving(true)
    try {
      const saved = await scoringRulesService.saveScoringRules(rules)
      setRules(saved)
      showToast('Scoring rules saved successfully.')
    } catch (err) {
      setError(err.message || 'Unable to save scoring rules.')
      showToast(err.message || 'Unable to save scoring rules.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!rules) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Breadcrumbs />
        <PageHeader
          title="Scoring Rules"
          description="Configure lead qualification weights, tiers, and lifecycle stages."
        />
        {error && (
          <div className="rounded-[var(--radius-md)] border border-[var(--status-error)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error)]">
            {error}
          </div>
        )}
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
            {TIER_FIELDS.map((tier) => (
              <div
                key={tier.key}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-4"
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
                  Tier {tier.label}
                </p>
                <div className="space-y-3">
                  <Input
                    label="Min"
                    type="number"
                    value={rules.tiers[tier.key].min}
                    onChange={(e) => updateTier(tier.key, 'min', e.target.value)}
                  />
                  <Input
                    label="Max"
                    type="number"
                    value={rules.tiers[tier.key].max}
                    onChange={(e) => updateTier(tier.key, 'max', e.target.value)}
                  />
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-accent)]"
                    style={{
                      width: `${Math.max(
                        8,
                        rules.tiers[tier.key].max - rules.tiers[tier.key].min,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  {rules.tiers[tier.key].min}–{rules.tiers[tier.key].max}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Lead Lifecycle</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Visual lifecycle used across Model 31 lead processing.
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
