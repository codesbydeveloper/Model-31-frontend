import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import { APP_SUBTITLE } from '../data/navigation'

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Welcome to Model 31" description={APP_SUBTITLE} />
      <Card>
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
          Sign in to open your dashboard.
        </p>
      </Card>
    </div>
  )
}
