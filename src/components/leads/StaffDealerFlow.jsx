import Card from '../common/Card'

export default function StaffDealerFlow({ showTransfer }) {
  return (
    <Card>
      <h2 className="text-base font-semibold">Staff Social → Official Dealer</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Source: Staff Personal Social Account · Status: MODEL 31 LEAD
      </p>
      {showTransfer && (
        <p className="mt-2 text-sm font-medium">Transfer to Official Dealer Channel</p>
      )}
      <ol className="mt-3 space-y-1 text-sm">
        {['Staff Account', 'Model 31', 'Official Dealer Channel', 'Manager / Deal Flow'].map(
          (step, index, list) => (
            <li key={step}>
              <p className="font-medium">{step}</p>
              {index < list.length - 1 && (
                <p className="text-xs text-[var(--text-muted)]">↓</p>
              )}
            </li>
          ),
        )}
      </ol>
    </Card>
  )
}
