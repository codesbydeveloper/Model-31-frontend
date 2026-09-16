import Card from '../common/Card'

const STATUS_COLOR = {
  ONLINE: 'var(--status-ready)',
  BUSY: 'var(--status-pending)',
  OFFLINE: 'var(--text-muted)',
  ACTIVE: 'var(--brand-accent)',
}

const CITY_POS = {
  'Los Angeles': { x: 14, y: 46 },
  Chicago: { x: 56, y: 26 },
  Dallas: { x: 46, y: 60 },
  Houston: { x: 50, y: 78 },
  Miami: { x: 78, y: 74 },
}

function cityPosition(city, index, total) {
  if (CITY_POS[city]) return CITY_POS[city]
  const col = index % 3
  const row = Math.floor(index / 3)
  return {
    x: 18 + col * 32,
    y: 28 + row * (total > 3 ? 36 : 0),
  }
}

function nodeOffset(index) {
  const ring = [
    { x: -7, y: 8 },
    { x: 8, y: 6 },
    { x: 0, y: 12 },
    { x: -10, y: -4 },
    { x: 10, y: -2 },
  ]
  return ring[index % ring.length]
}

export default function DispatchMap({ map, className = '' }) {
  if (!map) return null
  const cities = map.cities || []
  const legend = map.legend || ['Online', 'Busy', 'Offline', 'Active Lead']

  return (
    <Card className={`flex h-full flex-col ${className}`.trim()}>
      <h2 className="text-base font-semibold">AI Dispatch Map</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {map.subtitle || 'Lead → Rooftop → Available Salesperson'}
      </p>

      <div className="relative mt-4 min-h-[280px] flex-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-muted)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(#c8d0da 1px, transparent 1px), linear-gradient(90deg, #c8d0da 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {cities.map((city, index) => {
          const pos = cityPosition(city.city, index, cities.length)
          return (
            <div key={city.id || city.city}>
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-primary)] px-2 py-1 text-[10px] font-semibold text-white shadow-sm"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={city.rooftop || city.city}
              >
                {city.city}
              </div>
              {(city.nodes || []).map((node, nodeIndex) => {
                const offset = nodeOffset(nodeIndex)
                const isLead = String(node.type).toLowerCase() === 'lead'
                const status = String(node.status || '').toUpperCase()
                return (
                  <div
                    key={node.id}
                    className={
                      isLead
                        ? 'absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-sm ring-2 ring-white'
                        : 'absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white'
                    }
                    style={{
                      left: `${pos.x + offset.x}%`,
                      top: `${pos.y + offset.y}%`,
                      background: isLead
                        ? STATUS_COLOR.ACTIVE
                        : STATUS_COLOR[status] || STATUS_COLOR.ONLINE,
                    }}
                    title={`${city.rooftop || city.city} · ${isLead ? 'Active Lead' : status}`}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
        {legend.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            {String(item).toLowerCase().includes('lead') ? (
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand-accent)]" />
            ) : (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    STATUS_COLOR[String(item).toUpperCase()] ||
                    (String(item).toLowerCase().includes('busy')
                      ? STATUS_COLOR.BUSY
                      : String(item).toLowerCase().includes('off')
                        ? STATUS_COLOR.OFFLINE
                        : STATUS_COLOR.ONLINE),
                }}
              />
            )}
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}
