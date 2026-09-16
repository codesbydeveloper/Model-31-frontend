import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search leads, customers…"
          aria-label="Global search"
          className="input-field with-leading-icon h-9 w-44 text-sm lg:w-64"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute right-0 z-50 mt-1 w-80 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-4 shadow-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            No matching leads or customers.
          </p>
        </div>
      )}
    </div>
  )
}
