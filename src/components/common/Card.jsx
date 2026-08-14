import { cn } from '../../utils/cn'

export default function Card({
  children,
  className = '',
  padding = true,
  ...props
}) {
  return (
    <div
      className={cn('card', padding && 'p-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
