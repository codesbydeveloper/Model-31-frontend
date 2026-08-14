import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('input-field with-leading-icon', inputClassName)}
        {...props}
      />
    </div>
  )
}
