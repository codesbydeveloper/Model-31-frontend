import Card from '../common/Card'

export default function BuyOnlineCard({ available }) {
  if (!available) return null

  return (
    <Card>
      <h2 className="text-base font-semibold">Buy Online</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        This buyer is ready to continue the purchase with the dealership.
      </p>
    </Card>
  )
}
