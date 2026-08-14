import { CheckCircle2, CircleDashed } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import { APP_SUBTITLE } from '../data/navigation'
import { mockStatus } from '../services/mock'

const STATUS_ITEMS = [
  {
    label: 'Frontend',
    key: 'frontend',
    readyLabel: 'Ready',
    pendingLabel: 'Not Connected',
  },
  {
    label: 'Backend',
    key: 'backend',
    readyLabel: 'Ready',
    pendingLabel: 'Not Connected',
  },
  {
    label: 'Database',
    key: 'database',
    readyLabel: 'Ready',
    pendingLabel: 'Not Connected',
  },
  {
    label: 'Integrations',
    key: 'integrations',
    readyLabel: 'Ready',
    pendingLabel: 'Not Connected',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Welcome to AutoFlow"
        description={APP_SUBTITLE}
      />

      <Card className="mb-6">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
          Central platform for AI-powered customer conversations, lead
          qualification, dealership dispatch, sales operations, marketing
          automation, and attribution.
        </p>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Platform Status
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_ITEMS.map((item) => {
            const isReady = mockStatus[item.key] === 'ready'
            return (
              <Card key={item.key} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isReady
                      ? 'bg-[var(--status-ready-bg)] text-[var(--status-ready)]'
                      : 'bg-[var(--status-pending-bg)] text-[var(--status-pending)]'
                  }`}
                >
                  {isReady ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <CircleDashed size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <Badge
                    variant={isReady ? 'ready' : 'pending'}
                    className="mt-1.5"
                  >
                    {isReady ? item.readyLabel : item.pendingLabel}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
