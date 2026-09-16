import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../components/common/Button'
import StatusBadge from '../../../components/common/StatusBadge'
import { cn } from '../../../utils/cn'

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTime(time) {
  if (!time) return ''
  if (/am|pm/i.test(String(time))) return String(time)
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h)) return String(time)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${period}`
}

export default function AppointmentCalendar({
  appointments = [],
  mode = 'month',
  onModeChange,
}) {
  const [cursor, setCursor] = useState(() => new Date())

  const byDate = useMemo(() => {
    const map = {}
    appointments.forEach((apt) => {
      if (!map[apt.date]) map[apt.date] = []
      map[apt.date].push(apt)
    })
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.time.localeCompare(b.time)),
    )
    return map
  }, [appointments])

  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const shift = (amount) => {
    setCursor((prev) => {
      const next = new Date(prev)
      if (mode === 'month') next.setMonth(next.getMonth() + amount)
      else if (mode === 'week') next.setDate(next.getDate() + amount * 7)
      else next.setDate(next.getDate() + amount)
      return next
    })
  }

  const monthCells = useMemo(() => {
    const first = startOfMonth(cursor)
    const total = daysInMonth(cursor)
    const startPad = first.getDay()
    const cells = []
    for (let i = 0; i < startPad; i += 1) cells.push(null)
    for (let day = 1; day <= total; day += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day))
    }
    return cells
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = new Date(cursor)
    start.setDate(cursor.getDate() - cursor.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [cursor])

  const dayKey = toKey(cursor)
  const dayItems = byDate[dayKey] || []

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => shift(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <p className="min-w-[160px] text-center text-sm font-semibold sm:text-base">
            {mode === 'day'
              ? cursor.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : monthLabel}
          </p>
          <Button variant="secondary" size="sm" onClick={() => shift(1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="flex gap-1">
          {['month', 'week', 'day'].map((item) => (
            <Button
              key={item}
              size="sm"
              variant={mode === item ? 'primary' : 'secondary'}
              onClick={() => onModeChange?.(item)}
              className="capitalize"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {mode === 'month' && (
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--border-default)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="bg-[var(--bg-muted)] px-2 py-2 text-center text-xs font-semibold uppercase text-[var(--text-secondary)]"
              >
                {d}
              </div>
            ))}
            {monthCells.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-24 bg-[var(--bg-surface)]"
                  />
                )
              }
              const key = toKey(date)
              const items = byDate[key] || []
              const isToday = key === '2026-08-14'
              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-24 bg-[var(--bg-surface)] p-1.5',
                    isToday && 'ring-1 ring-inset ring-[var(--brand-accent)]',
                  )}
                >
                  <p className="mb-1 text-xs font-semibold">{date.getDate()}</p>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((apt) => (
                      <Link
                        key={apt.id}
                        to={`/salesperson/appointments/${apt.id}`}
                        className="block rounded bg-[var(--brand-accent-soft)] px-1.5 py-1 text-[10px] leading-tight text-[var(--brand-primary)] hover:opacity-90"
                      >
                        <span className="font-semibold">
                          {formatTime(apt.time)}
                        </span>{' '}
                        {apt.customerName}
                      </Link>
                    ))}
                    {items.length > 3 && (
                      <p className="text-[10px] text-[var(--text-muted)]">
                        +{items.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mode === 'week' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((date) => {
            const key = toKey(date)
            const items = byDate[key] || []
            return (
              <div
                key={key}
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3"
              >
                <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="mt-2 space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)]">No appointments</p>
                  )}
                  {items.map((apt) => (
                    <Link
                      key={apt.id}
                      to={`/salesperson/appointments/${apt.id}`}
                      className="block rounded-[var(--radius-md)] border border-[var(--border-default)] p-2 hover:bg-[var(--bg-muted)]"
                    >
                      <p className="text-xs font-semibold">{formatTime(apt.time)}</p>
                      <p className="text-sm font-medium">{apt.customerName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {apt.vehicle}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={apt.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {mode === 'day' && (
        <div className="space-y-3">
          {dayItems.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              No appointments on this day.
            </p>
          ) : (
            dayItems.map((apt) => (
              <Link
                key={apt.id}
                to={`/salesperson/appointments/${apt.id}`}
                className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 hover:bg-[var(--bg-muted)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-accent)]">
                    {formatTime(apt.time)}
                  </p>
                  <p className="text-base font-semibold">{apt.customerName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {apt.vehicle}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
