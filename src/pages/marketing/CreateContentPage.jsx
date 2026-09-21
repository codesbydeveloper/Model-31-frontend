import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import ContentPreview from '../../components/marketing/ContentPreview'
import { useToast } from '../../hooks/useToast'
import {
  SOCIAL_PLATFORMS,
  TONES,
  LANGUAGES,
  AUDIENCES,
} from '../../data/marketingContent'
import {
  getContentCreateOptions,
  getMarketingSalespeople,
  generateMarketingContent,
  regenerateMarketingContent,
  saveMarketingContentDraft,
  sendScriptToSalesperson,
  joinHashtags,
} from '../../services/api/marketingContentService'

const opt = (arr) => arr.map((v) => ({ value: v, label: v }))

const EMPTY_FORM = {
  dealershipId: '',
  campaignId: '',
  salespersonId: '',
  contentType: 'Sales Script',
  platform: 'Instagram',
  vehicle: '',
  offer: '',
  tone: 'Professional',
  language: 'English',
  audience: 'Luxury Buyer',
  brief: '',
  title: '',
  caption: '',
  body: '',
  cta: 'Message me for payment options',
  hashtags: '',
  imagePrompt: '',
  imageUrl: '',
  videoDuration: '30',
  scenes: [],
}

export default function CreateContentPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [dealerships, setDealerships] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [platforms, setPlatforms] = useState(
    SOCIAL_PLATFORMS.filter((item) => item !== 'WhatsApp'),
  )
  const [tones, setTones] = useState(TONES)
  const [languages, setLanguages] = useState(LANGUAGES)
  const [audiences, setAudiences] = useState(AUDIENCES)
  const [salespeople, setSalespeople] = useState([])
  const [contentId, setContentId] = useState(null)
  const [generatedItem, setGeneratedItem] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const t = window.setTimeout(async () => {
      try {
        const options = await getContentCreateOptions()
        setDealerships(options.dealerships)
        setCampaigns(options.campaigns)
        if (options.platforms?.length) setPlatforms(options.platforms)
        if (options.tones?.length) setTones(options.tones)
        if (options.languages?.length) setLanguages(options.languages)
        if (options.audiences?.length) setAudiences(options.audiences)
        const dealershipId = options.dealerships[0]?.id || ''
        const matching = options.campaigns.filter((c) => c.dealershipId === dealershipId)
        const campaignId = matching[0]?.id || options.campaigns[0]?.id || ''
        setForm((current) => ({
          ...current,
          dealershipId: current.dealershipId || dealershipId,
          campaignId: current.campaignId || campaignId,
          platform: current.platform || options.platforms[0] || current.platform,
          tone: current.tone || options.tones[0] || current.tone,
          language: current.language || options.languages[0] || current.language,
          audience: current.audience || options.audiences[0] || current.audience,
        }))
      } catch (err) {
        showToast(err.message || 'Unable to load create options.', 'error')
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!form.dealershipId) {
      setSalespeople([])
      return undefined
    }
    const timer = window.setTimeout(async () => {
      try {
        const list = await getMarketingSalespeople(form.dealershipId)
        setSalespeople(list)
        setForm((current) => {
          const stillValid = list.some((person) => person.id === current.salespersonId)
          return {
            ...current,
            salespersonId: stillValid ? current.salespersonId : list[0]?.id || '',
          }
        })
      } catch (err) {
        setSalespeople([])
        showToast(err.message || 'Unable to load salespeople.', 'error')
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [form.dealershipId, showToast])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const campaignOptions = useMemo(() => {
    const list = form.dealershipId
      ? campaigns.filter((c) => !c.dealershipId || c.dealershipId === form.dealershipId)
      : campaigns
    return list.map((c) => ({ value: c.id, label: c.name }))
  }, [campaigns, form.dealershipId])

  const hashtagList = useMemo(
    () =>
      String(form.hashtags || '')
        .split(/[\s,]+/)
        .map((h) => h.trim())
        .filter(Boolean),
    [form.hashtags],
  )

  const applyGenerated = (item) => {
    if (!item) return
    setContentId(item.id)
    setGeneratedItem(item)
    setForm((prev) => ({
      ...prev,
      title: item.caption || item.title,
      caption: item.caption || item.title,
      body: item.script || item.body,
      cta: item.cta || prev.cta,
      hashtags: joinHashtags(item.hashtags),
      imageUrl: '',
      scenes: [],
      contentType: 'Sales Script',
      platform: item.platform || prev.platform,
      tone: item.tone || prev.tone,
      language: item.language || prev.language,
      audience: item.audience || prev.audience,
      vehicle: item.vehicle || prev.vehicle,
    }))
    setGenerated(true)
  }

  const generate = async () => {
    if (!form.dealershipId || !form.campaignId) {
      showToast('Select a dealership and campaign first.', 'error')
      return
    }
    setGenerating(true)
    try {
      const result = await generateMarketingContent(form)
      applyGenerated(result)
      showToast('Sales script generated. Words only — no video.')
    } catch (err) {
      showToast(err.message || 'Unable to generate content.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const regenerate = async () => {
    if (!contentId) {
      await generate()
      return
    }
    setGenerating(true)
    try {
      const result = await regenerateMarketingContent(contentId)
      applyGenerated(result)
      showToast('Content regenerated.')
    } catch (err) {
      showToast(err.message || 'Unable to regenerate content.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const saveDraft = async () => {
    if (!contentId) {
      showToast('Generate content before saving a draft.', 'error')
      return
    }
    setSaving(true)
    try {
      const saved = await saveMarketingContentDraft(contentId, form)
      if (saved?.id) applyGenerated(saved)
      showToast('Draft saved.')
    } catch (err) {
      showToast(err.message || 'Unable to save draft.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const submit = async () => {
    if (!contentId) {
      showToast('Generate the script before sending it.', 'error')
      return
    }
    if (!String(form.salespersonId || '').trim()) {
      showToast('Select a salesperson to send this script.', 'error')
      return
    }
    setSaving(true)
    try {
      await saveMarketingContentDraft(contentId, form)
      await sendScriptToSalesperson(contentId, { salespersonId: form.salespersonId })
      showToast('Script sent to the salesperson.')
      navigate(`/marketing/content/${contentId}`)
    } catch (err) {
      showToast(err.message || 'Unable to send script.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/marketing/content">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title="Create Sales Script"
        description="Model 31 generates sales-script words only. No video, image, or auto-publish."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Brief</h2>
          <div className="grid gap-3">
            <Select
              label="Dealership"
              value={form.dealershipId}
              onChange={(e) => {
                const dealershipId = e.target.value
                const matching = campaigns.filter((c) => c.dealershipId === dealershipId)
                setForm((prev) => ({
                  ...prev,
                  dealershipId,
                  campaignId: matching[0]?.id || prev.campaignId,
                  salespersonId: '',
                }))
              }}
              options={dealerships.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Select
              label="Campaign"
              value={form.campaignId}
              onChange={(e) => set('campaignId', e.target.value)}
              options={campaignOptions}
            />
            <Select
              label="Salesperson"
              value={form.salespersonId}
              onChange={(e) => set('salespersonId', e.target.value)}
              placeholder="Select salesperson"
              options={salespeople.map((person) => ({
                value: person.id,
                label: person.label,
              }))}
            />
            <Select
              label="Platform"
              value={form.platform}
              onChange={(e) => set('platform', e.target.value)}
              options={opt(platforms)}
            />
            <Input
              label="Vehicle"
              value={form.vehicle}
              onChange={(e) => set('vehicle', e.target.value)}
            />
            <Input
              label="Offer"
              value={form.offer}
              onChange={(e) => set('offer', e.target.value)}
            />
            <Select
              label="Tone"
              value={form.tone}
              onChange={(e) => set('tone', e.target.value)}
              options={opt(tones)}
            />
            <Select
              label="Language"
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              options={opt(languages)}
            />
            <Select
              label="Target Audience"
              value={form.audience}
              onChange={(e) => set('audience', e.target.value)}
              options={opt(audiences)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Script brief</label>
              <textarea
                className="input-field min-h-24"
                value={form.brief}
                onChange={(e) => set('brief', e.target.value)}
                placeholder="Who is the buyer and what should the salesperson say?"
              />
            </div>
            <Input
              label="CTA"
              value={form.cta}
              onChange={(e) => set('cta', e.target.value)}
            />

            <Button onClick={generate} disabled={generating} className="min-h-11">
              {generating ? (
                <>
                  <LoadingSpinner size={16} />
                  Generating script...
                </>
              ) : (
                'Generate Sales Script'
              )}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <ContentPreview
            platform={form.platform}
            title={form.caption || form.title}
            body={form.body}
            cta={form.cta}
            hashtags={hashtagList}
            hideMedia
          />

          {generated && (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Generated Script</h2>
                <StatusBadge status={generatedItem?.status || 'DRAFT'} />
              </div>
              <div className="grid gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Script</label>
                  <textarea
                    className="input-field min-h-32"
                    value={form.body}
                    onChange={(e) => set('body', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Caption</label>
                  <textarea
                    className="input-field min-h-24"
                    value={form.caption}
                    onChange={(e) => set('caption', e.target.value)}
                  />
                </div>
                <Input
                  label="CTA"
                  value={form.cta}
                  onChange={(e) => set('cta', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-[var(--text-muted)]">Platform</span>
                    <br />
                    {form.platform}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Tone</span>
                    <br />
                    {form.tone}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Vehicle</span>
                    <br />
                    {generatedItem?.vehicle || form.vehicle || '—'}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Campaign</span>
                    <br />
                    {generatedItem?.campaign || '—'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={regenerate} disabled={generating}>
                    Regenerate
                  </Button>
                  <Button variant="secondary" onClick={saveDraft} disabled={saving}>
                    {saving ? <LoadingSpinner size={16} /> : 'Save Draft'}
                  </Button>
                  <Button onClick={submit} disabled={saving}>
                    Send to Salesperson
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
