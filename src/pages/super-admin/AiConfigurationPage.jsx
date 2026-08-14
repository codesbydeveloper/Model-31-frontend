import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Toggle from '../../components/common/Toggle'
import Select from '../../components/common/Select'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import settingsService from '../../services/mock/settingsService'
import { AI_TONES, AI_RESPONSE_STYLES } from '../../data/aiConfig'

export default function AiConfigurationPage() {
  const { showToast } = useToast()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setConfig(await settingsService.getAiConfig())
      setLoading(false)
    })()
  }, [])

  const updateSection = (section, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
  }

  const onSave = async () => {
    setSaving(true)
    try {
      await settingsService.saveAiConfig(config)
      showToast('AI configuration saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
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
        title="AI Configuration"
        description="Configure AI conversation, qualification, and automation behavior."
        actions={
          <Button onClick={onSave} disabled={saving}>
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
              checked={config.conversation.aiEnabled}
              onChange={(v) => updateSection('conversation', 'aiEnabled', v)}
            />
            <Toggle
              label="Automatic Responses"
              checked={config.conversation.automaticResponses}
              onChange={(v) =>
                updateSection('conversation', 'automaticResponses', v)
              }
            />
            <Toggle
              label="Language Detection"
              checked={config.conversation.languageDetection}
              onChange={(v) =>
                updateSection('conversation', 'languageDetection', v)
              }
            />
            <Toggle
              label="English"
              checked={config.conversation.english}
              onChange={(v) => updateSection('conversation', 'english', v)}
            />
            <Toggle
              label="Spanish"
              checked={config.conversation.spanish}
              onChange={(v) => updateSection('conversation', 'spanish', v)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Tone"
                value={config.conversation.tone}
                onChange={(e) =>
                  updateSection('conversation', 'tone', e.target.value)
                }
                options={AI_TONES}
              />
              <Select
                label="Response Style"
                value={config.conversation.responseStyle}
                onChange={(e) =>
                  updateSection('conversation', 'responseStyle', e.target.value)
                }
                options={AI_RESPONSE_STYLES}
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
              checked={config.qualification.budget}
              onChange={(v) => updateSection('qualification', 'budget', v)}
            />
            <Toggle
              label="Desired Vehicle"
              checked={config.qualification.desiredVehicle}
              onChange={(v) =>
                updateSection('qualification', 'desiredVehicle', v)
              }
            />
            <Toggle
              label="Buying Timeline"
              checked={config.qualification.buyingTimeline}
              onChange={(v) =>
                updateSection('qualification', 'buyingTimeline', v)
              }
            />
            <Toggle
              label="Location / Neighborhood"
              checked={config.qualification.location}
              onChange={(v) => updateSection('qualification', 'location', v)}
            />
            <Toggle
              label="Financing Preference"
              checked={config.qualification.financingPreference}
              onChange={(v) =>
                updateSection('qualification', 'financingPreference', v)
              }
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">AI Behavior</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              label="Conversation AI"
              checked={config.behavior.conversationAi}
              onChange={(v) => updateSection('behavior', 'conversationAi', v)}
            />
            <Toggle
              label="Lead Qualification"
              checked={config.behavior.leadQualification}
              onChange={(v) =>
                updateSection('behavior', 'leadQualification', v)
              }
            />
            <Toggle
              label="Automatic Lead Routing"
              checked={config.behavior.automaticLeadRouting}
              onChange={(v) =>
                updateSection('behavior', 'automaticLeadRouting', v)
              }
            />
            <Toggle
              label="AI Content Generation"
              checked={config.behavior.aiContentGeneration}
              onChange={(v) =>
                updateSection('behavior', 'aiContentGeneration', v)
              }
            />
            <Toggle
              label="AI Follow-up"
              checked={config.behavior.aiFollowUp}
              onChange={(v) => updateSection('behavior', 'aiFollowUp', v)}
            />
            <Toggle
              label="Appointment Assistance"
              checked={config.behavior.appointmentAssistance}
              onChange={(v) =>
                updateSection('behavior', 'appointmentAssistance', v)
              }
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
