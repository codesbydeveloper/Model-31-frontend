import Button from '../common/Button'

const LINKS = [
  { label: 'Open CapCut', href: 'https://www.capcut.com/' },
  { label: 'Open Instagram', href: 'https://www.instagram.com/' },
  { label: 'Open Facebook', href: 'https://www.facebook.com/' },
]

export default function ScriptTools({
  script = '',
  caption = '',
  copyEnabled = false,
  approved = false,
  onCopied,
}) {
  const canCopy = copyEnabled || approved
  const copy = async (value, message) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    onCopied?.(message)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-secondary)]">
        Model 31 only provides words. After approve, copy the script and paste it into CapCut or Instagram yourself. No video is generated here.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!canCopy}
          onClick={() => void copy(script, 'Script copied.')}
        >
          Copy Script
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!canCopy}
          onClick={() => void copy(caption, 'Caption copied.')}
        >
          Copy Caption
        </Button>
        {LINKS.map((link) =>
          canCopy ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost">
                {link.label}
              </Button>
            </a>
          ) : (
            <Button key={link.href} size="sm" variant="ghost" disabled>
              {link.label}
            </Button>
          ),
        )}
      </div>
    </div>
  )
}
