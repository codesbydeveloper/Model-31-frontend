import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPathForRole } from '../data/roles'

export default function NotFoundPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col py-6 sm:py-10">
      <Breadcrumbs items={[{ label: '404', path: location.pathname }]} />
      <Card className="text-center">
        <p className="text-5xl font-semibold tracking-tight text-[var(--brand-primary)]">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          className="mt-6"
          onClick={() =>
            navigate(getDashboardPathForRole(user?.role), { replace: true })
          }
        >
          Go to Dashboard
        </Button>
      </Card>
    </div>
  )
}
