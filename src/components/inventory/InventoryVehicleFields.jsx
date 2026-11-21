import Input from '../common/Input'

export const EMPTY_VEHICLE_FORM = {
  vin: '',
  year: '',
  make: '',
  model: '',
  price: '',
  trim: '',
  mileage: '',
  color: '',
  stockNumber: '',
}

function textField(value) {
  if (value == null) return ''
  const next = String(value).trim()
  return next === '—' ? '' : next
}

export function vehicleFormFromRow(row = {}) {
  return {
    vin: textField(row.vin),
    year: textField(row.year),
    make: textField(row.make),
    model: textField(row.model),
    price: row.price == null || row.price === '' ? '' : String(row.price),
    trim: textField(row.trim),
    mileage: row.mileage == null || row.mileage === '' ? '' : String(row.mileage),
    color: textField(row.color),
    stockNumber: textField(row.stockNumber),
  }
}

export function vehicleFormError(form) {
  const missing = !String(form.vin || '').trim()
    || !String(form.year || '').trim()
    || !String(form.make || '').trim()
    || !String(form.model || '').trim()
    || String(form.price ?? '').trim() === ''
  return missing ? 'VIN, year, make, model, and price are required.' : ''
}

export default function InventoryVehicleFields({ values, onChange }) {
  const set = (key) => (event) => onChange(key, event.target.value)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input label="VIN" value={values.vin} onChange={set('vin')} />
      <Input label="Year" value={values.year} onChange={set('year')} inputMode="numeric" />
      <Input label="Make" value={values.make} onChange={set('make')} />
      <Input label="Model" value={values.model} onChange={set('model')} />
      <Input label="Price" value={values.price} onChange={set('price')} inputMode="decimal" />
      <Input label="Trim" value={values.trim} onChange={set('trim')} />
      <Input label="Mileage" value={values.mileage} onChange={set('mileage')} inputMode="numeric" />
      <Input label="Color" value={values.color} onChange={set('color')} />
      <Input label="Stock Number" value={values.stockNumber} onChange={set('stockNumber')} />
    </div>
  )
}
