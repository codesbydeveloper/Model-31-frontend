import Card from '../common/Card'

const DEFAULT_STEPS = [
  'Staff Account',
  'Model 31',
  'Official Dealer Channel',
  'Manager / Deal Flow',
]

export default function StaffDealerFlow({
  showTransfer,
  title,
  source,
  status,
  steps,
}) {
  const flowSteps = steps?.length ? steps : DEFAULT_STEPS

  return (
    <Card>
      <h2 className="text-base font-semibold">
        {title || 'Staff Social → Official Dealer'}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Source: {source || 'Staff Personal Social Account'} · Status:{' '}
        {status || 'MODEL 31 LEAD'}
      </p>
      {showTransfer && !steps?.length && (
        <p className="mt-2 text-sm font-medium">Transfer to Official Dealer Channel</p>
      )}
      <ol className="mt-3 space-y-1 text-sm">
        {flowSteps.map((step, index, list) => (
          <li key={`${step}-${index}`}>
            <p className="font-medium">{step}</p>
            {index < list.length - 1 && (
              <p className="text-xs text-[var(--text-muted)]">↓</p>
            )}
          </li>
        ))}
      </ol>
    </Card>
  )
}
