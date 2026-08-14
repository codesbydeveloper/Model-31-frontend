import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import EmptyState from '../components/ui/EmptyState'
import { LayoutGrid } from 'lucide-react'

export default function ModulesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Modules"
        description="Business modules will be configured in later steps."
      />
      <Card padding={false}>
        <EmptyState
          icon={LayoutGrid}
          title="Modules coming soon"
          description="Role-based modules for Super Admin, Dealership Admin, BDC, Sales, and Marketing will appear here."
        />
      </Card>
    </div>
  )
}
