import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { useToast } from '../../hooks/useToast'
import customerIdentityService from '../../services/mock/customerIdentityService'
import leadService from '../../services/mock/leadService'
import PipelineBadge from '../../components/common/PipelineBadge'
import { PIPELINE_TYPES, classifyLead } from '../../utils/pipeline'
import BuyerGenomeCard from '../../components/leads/BuyerGenomeCard'
import BehavioralSignalsCard from '../../components/leads/BehavioralSignalsCard'
import buyerGenomeService from '../../services/mock/buyerGenomeService'

export default function CustomerIdentityDetailPage() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [customer, setCustomer] = useState(null)
  const [linkedLeads, setLinkedLeads] = useState([])
  const [genome, setGenome] = useState(null)
  const [signals, setSignals] = useState([])
  const [duplicates, setDuplicates] = useState([])
  const [compare, setCompare] = useState(null)
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await customerIdentityService.getCustomerById(id)
      setCustomer(data)
      if (data?.leadIds?.length) {
        const leads = await Promise.all(
          data.leadIds.map((leadId) => leadService.getLeadById(leadId)),
        )
        setLinkedLeads(leads.filter(Boolean).map((lead) => classifyLead(lead)))
        const firstId = data.leadIds[0]
        const [g, s] = await Promise.all([
          buyerGenomeService.getBuyerGenome(firstId),
          buyerGenomeService.getBehaviorSignals(firstId),
        ])
        setGenome(g)
        setSignals(s)
      } else {
        setLinkedLeads([])
        setGenome(null)
        setSignals([])
      }
      if (data?.potentialDuplicates?.length) {
        const all = await customerIdentityService.getCustomerIdentity()
        setDuplicates(
          all.filter((c) => data.potentialDuplicates.includes(c.id) && c.status !== 'MERGED'),
        )
      } else {
        setDuplicates([])
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!customer) {
    return (
      <Card className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold">Customer not found</h1>
        <Link to="/super-admin/customer-identity" className="mt-4 inline-block">
          <Button variant="secondary">Back</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumbs />
      <div className="mb-3">
        <Link to="/super-admin/customer-identity">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={customer.name}
        description={`${customer.dealership} · ${customer.location}`}
        actions={<StatusBadge status={customer.status} />}
      />

      {linkedLeads.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {linkedLeads.map((lead) => {
            const isModel31 = lead.pipelineType === PIPELINE_TYPES.MODEL31
            return (
              <Card key={lead.id}>
                <h2 className="mb-3 text-base font-semibold">Lead Pipeline</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--text-secondary)]">Pipeline</dt>
                    <dd>
                      <PipelineBadge pipelineType={lead.pipelineType} />
                    </dd>
                  </div>
                  <Row label="Lead Source" value={lead.source} />
                  <Row label="Lead ID" value={lead.id} />
                  <Row
                    label={isModel31 ? 'Model 31 Signature' : 'Model 31 Status'}
                    value={isModel31 ? 'Verified' : 'Read Only'}
                  />
                </dl>
              </Card>
            )
          })}
        </div>
      )}

      {(genome || signals.length > 0) && (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BuyerGenomeCard genome={genome} />
          <BehavioralSignalsCard signals={signals} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Profile</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Email" value={customer.email} />
            <Row label="Phone" value={customer.phone} />
            <Row label="Location" value={customer.location} />
            <Row label="Language" value={customer.language} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Identifiers</h2>
          <dl className="space-y-2 text-sm">
            <Row label="AutoFlow Customer ID" value={customer.autoFlowId} />
            <Row label="CRM ID" value={customer.crmId} />
            <Row label="Lead IDs" value={(customer.leadIds || []).join(', ')} />
          </dl>
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Channels</p>
            <div className="flex flex-wrap gap-2">
              {(customer.channels || []).map((ch) => (
                <span
                  key={ch}
                  className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-xs font-medium"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {duplicates.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 text-base font-semibold">Potential Duplicate</h2>
          <div className="space-y-3">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{dup.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{dup.email}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{dup.phone}</p>
                </div>
                <Button size="sm" onClick={() => setCompare(dup)}>
                  Review Duplicate
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-semibold">Unified Timeline</h2>
        <ul className="space-y-2">
          {(customer.timeline || []).map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm"
            >
              <p className="font-medium">{item.event}</p>
              <p className="text-[var(--text-secondary)]">{item.detail}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{item.time}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={Boolean(compare)}
        onClose={() => setCompare(null)}
        title="Review Duplicate"
        className="max-w-3xl"
      >
        {compare && (
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CompareCard title="Customer A" customer={customer} />
              <CompareCard title="Customer B" customer={compare} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCompare(null)}>
                Cancel
              </Button>
              <Button
                disabled={merging}
                onClick={async () => {
                  setMerging(true)
                  try {
                    await customerIdentityService.mergeCustomerRecords(customer.id, compare.id)
                    showToast('Records merged successfully.')
                    setCompare(null)
                    await load()
                  } finally {
                    setMerging(false)
                  }
                }}
              >
                {merging ? <LoadingSpinner size={16} /> : 'Merge Records'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function CompareCard({ title, customer }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-3 text-sm">
      <p className="mb-2 font-semibold">{title}</p>
      <p>{customer.name}</p>
      <p className="text-[var(--text-secondary)]">{customer.email}</p>
      <p className="text-[var(--text-secondary)]">{customer.phone}</p>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{customer.autoFlowId}</p>
      <p className="text-xs text-[var(--text-muted)]">{customer.crmId}</p>
    </div>
  )
}
