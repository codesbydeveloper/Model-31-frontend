import { cn } from '../../utils/cn'

export default function Select({
  label,
  id,
  error,
  options = [],
  className = '',
  containerClassName = '',
  placeholder,
  ...props
}) {
  const selectId = id || props.name

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'input-field',
          error && 'border-[var(--status-error)]',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const labelText = typeof option === 'string' ? option : option.label
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          )
        })}
      </select>
      {error && <p className="text-xs text-[var(--status-error)]">{error}</p>}
    </div>
  )
}
