import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import EmptyState from '../components/ui/EmptyState'
import { LayoutGrid } from 'lucide-react'

export default function ModulesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Modules"
        description="Use the sidebar to open Super Admin, Dealership, BDC, Sales, or Marketing."
      />
      <Card padding={false}>
        <EmptyState
          icon={LayoutGrid}
          title="Choose a module"
          description="Role workspaces are in the sidebar after you sign in."
        />
      </Card>
    </div>
  )
}
