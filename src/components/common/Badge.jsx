import { cn } from '../../utils/cn'

const variants = {
  ready: 'badge-ready',
  pending: 'badge-pending',
  error: 'badge-error',
  neutral: 'badge-neutral',
}

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
}) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
