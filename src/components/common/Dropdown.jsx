import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from './Button'

const MENU_MIN_WIDTH = 180
const VIEWPORT_GAP = 8
const BUTTON_GAP = 6

export default function Dropdown({
  label = 'Options',
  items = [],
  onSelect,
  className = '',
  buttonClassName = '',
  align = 'right',
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: MENU_MIN_WIDTH })
  const rootRef = useRef(null)
  const menuRef = useRef(null)

  const updatePosition = () => {
    const trigger = rootRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const menuWidth = Math.max(
      MENU_MIN_WIDTH,
      menuRef.current?.offsetWidth || MENU_MIN_WIDTH,
    )
    const menuHeight = menuRef.current?.offsetHeight || 0

    let left = align === 'right' ? rect.right - menuWidth : rect.left
    left = Math.max(
      VIEWPORT_GAP,
      Math.min(left, window.innerWidth - menuWidth - VIEWPORT_GAP),
    )

    let top = rect.bottom + BUTTON_GAP
    if (
      menuHeight &&
      top + menuHeight > window.innerHeight - VIEWPORT_GAP &&
      rect.top - menuHeight - BUTTON_GAP >= VIEWPORT_GAP
    ) {
      top = rect.top - menuHeight - BUTTON_GAP
    }

    setCoords({ top, left, width: menuWidth })
  }

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, align])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, align])

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={buttonClassName}
      >
        {label}
        {typeof label === 'string' ? <ChevronDown size={16} /> : null}
      </Button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[80] min-w-[180px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] py-1 shadow-[var(--shadow-lg)]"
            style={{
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
            }}
          >
            {items.map((item) => (
              <button
                key={item.value || item.label}
                type="button"
                role="menuitem"
                className="flex w-full items-center px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                onClick={() => {
                  onSelect?.(item)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
