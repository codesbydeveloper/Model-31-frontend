import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPathForRole } from '../data/roles'

export default function AccessDeniedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGoToDashboard = () => {
    if (user?.role) {
      navigate(getDashboardPathForRole(user.role), { replace: true })
      return
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col py-6 sm:py-10">
      <Breadcrumbs />
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--status-error-bg)] text-[var(--status-error)]">
          <ShieldOff size={26} />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-[0.9375rem]">
          You do not have permission to access this page.
        </p>
        {user?.role && (
          <div className="mt-3 flex justify-center">
            <Badge variant="neutral">{user.role}</Badge>
          </div>
        )}
        <Button className="mt-6" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  )
}
