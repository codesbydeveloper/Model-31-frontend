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
import ContentPreview from '../../components/marketing/ContentPreview'
import { useToast } from '../../hooks/useToast'
import {
  CONTENT_TYPES,
  SOCIAL_PLATFORMS,
  DEALERSHIPS,
  TONES,
  LANGUAGES,
  AUDIENCES,
} from '../../data/marketingContent'
import marketingContentService from '../../services/mock/marketingContentService'
import campaignService from '../../services/mock/campaignService'

const opt = (arr) => arr.map((v) => ({ value: v, label: v }))

export default function CreateContentPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [form, setForm] = useState({
    dealership: DEALERSHIPS[0],
    campaign: '',
    contentType: 'Social Post',
    platform: 'Instagram',
    vehicle: '2026 Lexus RX',
    offer: '',
    tone: 'Professional',
    language: 'English',
    audience: 'Luxury Buyer',
    brief: '',
    title: '',
    body: '',
    hashtags: '',
    imagePrompt: 'Luxury black SUV parked outside a modern dealership at sunset.',
    imageUrl: '',
    videoDuration: '30',
    scenes: [],
  })

  useEffect(() => {
    const t = window.setTimeout(async () => {
      const camps = await campaignService.getCampaigns()
      setCampaigns(camps)
      setForm((f) => ({ ...f, campaign: camps[0]?.name || '' }))
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const hashtagList = useMemo(
    () =>
      String(form.hashtags || '')
        .split(/[\s,]+/)
        .map((h) => h.trim())
        .filter(Boolean),
    [form.hashtags],
  )

  const generate = async () => {
    setGenerating(true)
    try {
      const result = await marketingContentService.generateMockContent(form)
      setForm((prev) => ({
        ...prev,
        title: result.title,
        body: result.body,
        hashtags: result.hashtags.join(' '),
        imagePrompt: result.imagePrompt || prev.imagePrompt,
        videoDuration: result.videoDuration || prev.videoDuration,
        scenes: result.scenes || [],
      }))
      setGenerated(true)
      showToast('AI content generated successfully.')
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async () => {
    setGenerating(true)
    try {
      await new Promise((r) => window.setTimeout(r, 1000))
      set('imageUrl', 'mock')
      showToast('Mock image generated.')
    } finally {
      setGenerating(false)
    }
  }

  const save = async (status) => {
    setSaving(true)
    try {
      const created = await marketingContentService.createContent({
        ...form,
        hashtags: hashtagList,
        status: status === 'submit' ? 'PENDING APPROVAL' : 'DRAFT',
      })
      if (status === 'submit') {
        await marketingContentService.submitForApproval(created.id)
        showToast('Submitted for approval.')
      } else {
        showToast('Draft saved.')
      }
      navigate(`/marketing/content/${created.id}`)
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
        title="Create Content"
        description="Generate AI marketing content with mock generation (no external AI)."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Brief</h2>
          <div className="grid gap-3">
            <Select
              label="Dealership"
              value={form.dealership}
              onChange={(e) => set('dealership', e.target.value)}
              options={opt(DEALERSHIPS)}
            />
            <Select
              label="Campaign"
              value={form.campaign}
              onChange={(e) => set('campaign', e.target.value)}
              options={campaigns.map((c) => ({ value: c.name, label: c.name }))}
            />
            <Select
              label="Content Type"
              value={form.contentType}
              onChange={(e) => set('contentType', e.target.value)}
              options={opt(CONTENT_TYPES)}
            />
            <Select
              label="Platform"
              value={form.platform}
              onChange={(e) => set('platform', e.target.value)}
              options={opt(SOCIAL_PLATFORMS.filter((p) => p !== 'WhatsApp'))}
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
              options={opt(TONES)}
            />
            <Select
              label="Language"
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              options={opt(LANGUAGES)}
            />
            <Select
              label="Target Audience"
              value={form.audience}
              onChange={(e) => set('audience', e.target.value)}
              options={opt(AUDIENCES)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Content Brief</label>
              <textarea
                className="input-field min-h-24"
                value={form.brief}
                onChange={(e) => set('brief', e.target.value)}
                placeholder="Describe the goal of this content..."
              />
            </div>

            {form.contentType === 'Image Prompt' && (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-3">
                <label className="mb-1.5 block text-sm font-medium">Image Prompt</label>
                <textarea
                  className="input-field min-h-20"
                  value={form.imagePrompt}
                  onChange={(e) => set('imagePrompt', e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={generateImage} disabled={generating}>
                    {generating ? <LoadingSpinner size={14} /> : 'Generate Image'}
                  </Button>
                  {form.imageUrl && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => showToast('Image selected.')}>
                        Use Image
                      </Button>
                      <Button size="sm" variant="secondary" onClick={generateImage}>
                        Regenerate
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => set('imageUrl', '')}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
                {form.imageUrl === 'mock' && (
                  <div className="mt-3 flex h-36 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-sm text-[var(--text-muted)]">
                    Mock generated image placeholder
                  </div>
                )}
              </div>
            )}

            {form.contentType === 'Video Script' && (
              <Select
                label="Video Duration"
                value={form.videoDuration}
                onChange={(e) => set('videoDuration', e.target.value)}
                options={[
                  { value: '15', label: '15 seconds' },
                  { value: '30', label: '30 seconds' },
                  { value: '60', label: '60 seconds' },
                ]}
              />
            )}

            <Button onClick={generate} disabled={generating} className="min-h-11">
              {generating ? (
                <>
                  <LoadingSpinner size={16} />
                  Generating AI Content...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <ContentPreview
            platform={form.platform}
            title={form.title}
            body={form.body}
            hashtags={hashtagList}
            imageUrl={form.imageUrl}
          />

          {generated && (
            <Card>
              <h2 className="mb-3 text-base font-semibold">Generated Content Editor</h2>
              <div className="grid gap-3">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Content</label>
                  <textarea
                    className="input-field min-h-32"
                    value={form.body}
                    onChange={(e) => set('body', e.target.value)}
                  />
                </div>
                <Input
                  label="Hashtags"
                  value={form.hashtags}
                  onChange={(e) => set('hashtags', e.target.value)}
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
                    <span className="text-[var(--text-muted)]">Language</span>
                    <br />
                    {form.language}
                  </p>
                </div>

                {form.contentType === 'Video Script' && form.scenes?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Scene structure</p>
                    {form.scenes.map((scene) => (
                      <div
                        key={scene.scene}
                        className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                      >
                        <p className="font-medium">Scene {scene.scene}</p>
                        <p className="text-[var(--text-secondary)]">{scene.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={generate} disabled={generating}>
                    Regenerate
                  </Button>
                  <Button variant="secondary" onClick={() => save('draft')} disabled={saving}>
                    {saving ? <LoadingSpinner size={16} /> : 'Save Draft'}
                  </Button>
                  <Button onClick={() => save('submit')} disabled={saving}>
                    Submit for Approval
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
