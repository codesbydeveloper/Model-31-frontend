function labelize(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function showValue(value) {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function primitiveEntries(record) {
  return Object.entries(record || {}).filter(([, value]) => {
    if (value == null || value === '') return false
    return ['string', 'number', 'boolean'].includes(typeof value)
  })
}

function FactList({ entries }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {labelize(key)}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">
            {showValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function RecordFacts({ record }) {
  const entries = primitiveEntries(record)
  const groups = Object.entries(record || {}).filter(([, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    return primitiveEntries(value).length > 0
  })

  if (!entries.length && !groups.length) {
    return <p className="text-sm text-[var(--text-secondary)]">Nothing to show yet.</p>
  }

  return (
    <div className="space-y-5">
      {entries.length ? <FactList entries={entries} /> : null}
      {groups.map(([key, value]) => (
        <div key={key}>
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{labelize(key)}</h3>
          <FactList entries={primitiveEntries(value)} />
        </div>
      ))}
    </div>
  )
}

const HIDDEN_KEYS = new Set(['_key', '_raw'])

export function columnsForRows(rows) {
  const sample = rows.find((row) => row && typeof row === 'object') || {}
  return Object.keys(sample)
    .filter((key) => !HIDDEN_KEYS.has(key) && !key.startsWith('_'))
    .filter((key) => ['string', 'number', 'boolean'].includes(typeof sample[key]) || sample[key] == null)
    .slice(0, 7)
    .map((key) => ({
      key,
      label: labelize(key),
      render: (row) => showValue(row[key]),
    }))
}
