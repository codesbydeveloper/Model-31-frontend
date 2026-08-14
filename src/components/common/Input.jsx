import { cn } from '../../utils/cn'

export default function Input({
  label,
  id,
  error,
  className = '',
  containerClassName = '',
  ...props
}) {
  const inputId = id || props.name

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input-field',
          error && 'border-[var(--status-error)]',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--status-error)]">{error}</p>
      )}
    </div>
  )
}
