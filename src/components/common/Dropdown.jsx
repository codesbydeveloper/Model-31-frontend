import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from './Button'

export default function Dropdown({
  label = 'Options',
  items = [],
  onSelect,
  className = '',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={buttonClassName}
      >
        {label}
        {typeof label === 'string' ? <ChevronDown size={16} /> : null}
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 min-w-[180px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
          {items.map((item) => (
            <button
              key={item.value || item.label}
              type="button"
              className="flex w-full items-center px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              onClick={() => {
                onSelect?.(item)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
