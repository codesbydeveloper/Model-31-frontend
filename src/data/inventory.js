export const INVENTORY_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'PENDING']

export const inventoryStats = {
  totalVehicles: 248,
  available: 186,
  reserved: 28,
  sold: 24,
  lowInventory: 9,
  priceChanges: 14,
}

export const inventorySignals = [
  { id: 'sig_1', type: 'High Demand', detail: '2026 Lexus RX inquiries up 34% this week', severity: 'INFO' },
  { id: 'sig_2', type: 'Low Inventory', detail: 'BMW X5 stock below 5 units in Miami', severity: 'WARNING' },
  { id: 'sig_3', type: 'Price Drop', detail: '3 vehicles reduced in last 48 hours', severity: 'INFO' },
  { id: 'sig_4', type: 'Long Days in Inventory', detail: '12 vehicles over 90 days', severity: 'WARNING' },
  { id: 'sig_5', type: 'New Arrival', detail: '8 vehicles added today', severity: 'INFO' },
]

const makes = ['Lexus', 'BMW', 'Tesla', 'Mercedes', 'Cadillac', 'Toyota', 'Audi']
const models = ['RX', 'X5', 'Model Y', 'GLE', 'Escalade', 'Camry', 'Q7']
const trims = ['Premium', 'Luxury', 'Sport', 'Base', 'Platinum']
const dealers = [
  'Miami Luxury Motors',
  'Chicago Auto Group',
  'Dallas Premium Motors',
  'Los Angeles Auto Center',
  'Houston Automotive Group',
  'Atlanta Drive Center',
]
const colors = ['Black', 'White', 'Silver', 'Blue', 'Gray']
const statuses = INVENTORY_STATUSES

export const initialInventory = Array.from({ length: 32 }, (_, i) => {
  const make = makes[i % makes.length]
  const model = models[i % models.length]
  const original = 42000 + i * 1800
  const current = original - (i % 3 === 0 ? 2000 : 0)
  const previous = original - (i % 3 === 0 ? 1000 : 0)
  const status = statuses[i % statuses.length]
  return {
    id: `inv_${String(i + 1).padStart(3, '0')}`,
    vin: `1HGCM${String(800000 + i * 137).slice(0, 6)}${String(1000 + i).slice(-4)}`,
    vehicle: `2026 ${make} ${model}`,
    year: 2026,
    make,
    model,
    trim: trims[i % trims.length],
    price: current,
    originalPrice: original,
    previousPrice: previous,
    priceChangeDate: i % 3 === 0 ? '2026-08-10' : null,
    mileage: 12 + (i % 40),
    color: colors[i % colors.length],
    status,
    dealership: dealers[i % dealers.length],
    daysInInventory: 5 + (i * 3) % 110,
    lastUpdated: '2026-08-14',
    priceHistory: [
      { date: '2026-06-01', price: original, label: 'Original' },
      ...(i % 3 === 0
        ? [
            { date: '2026-07-15', price: previous, label: 'Previous' },
            { date: '2026-08-10', price: current, label: 'Current' },
          ]
        : [{ date: '2026-08-14', price: current, label: 'Current' }]),
    ],
    inventoryHistory: [
      { date: '2026-06-01', event: 'Received into inventory', actor: 'System' },
      { date: '2026-06-02', event: 'Listed as available', actor: 'Inventory Manager' },
      ...(status === 'RESERVED'
        ? [{ date: '2026-08-12', event: 'Reserved for customer', actor: 'Sales' }]
        : []),
      ...(status === 'SOLD'
        ? [{ date: '2026-08-08', event: 'Marked sold', actor: 'Sales' }]
        : []),
    ],
  }
})
