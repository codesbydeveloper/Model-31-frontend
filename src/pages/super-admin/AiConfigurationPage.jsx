import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Toggle from '../../components/common/Toggle'
import Select from '../../components/common/Select'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { AI_TONES, AI_RESPONSE_STYLES } from '../../data/aiConfig'
import {
  getAiConfiguration,
  saveAiConfiguration,
} from '../../services/api/aiConfigurationService'

export default function AiConfigurationPage() {
  const { showToast } = useToast()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setConfig(await getAiConfiguration())
    } catch (err) {
      setConfig(null)
      showToast(err.message || 'Unable to load AI configuration.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  const updateSection = (section, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
  }

  const onSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const saved = await saveAiConfiguration(config)
      setConfig(saved)
      showToast('AI configuration saved successfully.')
    } catch (err) {
      showToast(err.message || 'Unable to save AI configuration.', 'error')
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

  if (!config) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Breadcrumbs />
        <PageHeader
          title="AI Configuration"
          description="Configure AI conversation, qualification, and automation behavior."
        />
        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Unable to load AI configuration.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  const tones = config.options?.tones?.length ? config.options.tones : AI_TONES
  const styles = config.options?.responseStyles?.length
    ? config.options.responseStyles
    : AI_RESPONSE_STYLES

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <PageHeader
        title="AI Configuration"
        description="Configure AI conversation, qualification, and automation behavior."
        actions={
          <Button onClick={() => void onSave()} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                Saving…
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        }
      />

      <div className="space-y-5">
        <Card>
          <h2 className="text-base font-semibold">Conversation AI</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              label="AI Enabled"
              checked={config.conversationAi.aiEnabled}
              onChange={(v) => updateSection('conversationAi', 'aiEnabled', v)}
            />
            <Toggle
              label="Automatic Responses"
              checked={config.conversationAi.automaticResponses}
              onChange={(v) => updateSection('conversationAi', 'automaticResponses', v)}
            />
            <Toggle
              label="Language Detection"
              checked={config.conversationAi.languageDetection}
              onChange={(v) => updateSection('conversationAi', 'languageDetection', v)}
            />
            <Toggle
              label="English"
              checked={config.conversationAi.english}
              onChange={(v) => updateSection('conversationAi', 'english', v)}
            />
            <Toggle
              label="Spanish"
              checked={config.conversationAi.spanish}
              onChange={(v) => updateSection('conversationAi', 'spanish', v)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Tone"
                value={config.conversationAi.tone}
                onChange={(e) => updateSection('conversationAi', 'tone', e.target.value)}
                options={tones}
              />
              <Select
                label="Response Style"
                value={config.conversationAi.responseStyle}
                onChange={(e) =>
                  updateSection('conversationAi', 'responseStyle', e.target.value)
                }
                options={styles}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Lead Qualification</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Enable or disable qualification parameters collected by AI.
          </p>
          <div className="mt-4 space-y-4">
            <Toggle
              label="Budget"
              checked={config.leadQualification.budget}
              onChange={(v) => updateSection('leadQualification', 'budget', v)}
            />
            <Toggle
              label="Desired Vehicle"
              checked={config.leadQualification.desiredVehicle}
              onChange={(v) => updateSection('leadQualification', 'desiredVehicle', v)}
            />
            <Toggle
              label="Buying Timeline"
              checked={config.leadQualification.buyingTimeline}
              onChange={(v) => updateSection('leadQualification', 'buyingTimeline', v)}
            />
            <Toggle
              label="Location / Neighborhood"
              checked={config.leadQualification.location}
              onChange={(v) => updateSection('leadQualification', 'location', v)}
            />
            <Toggle
              label="Financing Preference"
              checked={config.leadQualification.financingPreference}
              onChange={(v) =>
                updateSection('leadQualification', 'financingPreference', v)
              }
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">AI Behavior</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              label="Conversation AI"
              checked={config.aiBehavior.conversationAi}
              onChange={(v) => updateSection('aiBehavior', 'conversationAi', v)}
            />
            <Toggle
              label="Lead Qualification"
              checked={config.aiBehavior.leadQualification}
              onChange={(v) => updateSection('aiBehavior', 'leadQualification', v)}
            />
            <Toggle
              label="Automatic Lead Routing"
              checked={config.aiBehavior.automaticLeadRouting}
              onChange={(v) => updateSection('aiBehavior', 'automaticLeadRouting', v)}
            />
            <Toggle
              label="AI Content Generation"
              checked={config.aiBehavior.aiContentGeneration}
              onChange={(v) => updateSection('aiBehavior', 'aiContentGeneration', v)}
            />
            <Toggle
              label="AI Follow-up"
              checked={config.aiBehavior.aiFollowUp}
              onChange={(v) => updateSection('aiBehavior', 'aiFollowUp', v)}
            />
            <Toggle
              label="Appointment Assistance"
              checked={config.aiBehavior.appointmentAssistance}
              onChange={(v) =>
                updateSection('aiBehavior', 'appointmentAssistance', v)
              }
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
