import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import Card from '../common/Card'
import StatCard from '../common/StatCard'
import DataTable from '../common/DataTable'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import { formatNumber } from '../../utils/table'

const PIE_COLORS = ['#0f2b46', '#1a6b8a', '#1a7a4c', '#9a6b1a', '#5a6b7d']

export default function UnderwaterRescueSection({ data, onOpenFingerprint }) {
  if (!data) return null
  const { kpis, activity, rescueChart, revenueChart, signalBreakdown } = data

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border-2 border-[var(--brand-accent)]/35 bg-gradient-to-br from-[#0f2b46]/5 to-[var(--brand-accent-soft)] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-semibold tracking-wide text-white">
            Included Free in Model 31
          </div>
          <h2 className="text-xl font-semibold text-[var(--brand-primary)]">
            Underwater Rescue
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
            Recover cold, abandoned, and at-risk opportunities. Read-only CRM access only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Rescued Leads" value={formatNumber(kpis.rescuedLeads)} />
        <StatCard label="Rescued Appointments" value={formatNumber(kpis.rescuedAppointments)} />
        <StatCard label="Rescued Sales" value={formatNumber(kpis.rescuedSales)} />
        <StatCard
          label="Average Gross"
          value={`$${formatNumber(kpis.averageGross)}`}
        />
        <StatCard
          label="Revenue Recovered This Month"
          value={`$${formatNumber(kpis.revenueMonth)}`}
        />
        <StatCard
          label="Revenue Recovered This Year"
          value={`$${formatNumber(kpis.revenueYear)}`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="bg-[var(--bg-surface)]">
          <h3 className="mb-3 text-sm font-semibold">Rescue Activity</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rescueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ed" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rescued" name="Rescued" fill="#0f2b46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="appointments" name="Appointments" fill="#1a6b8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" name="Sales" fill="#1a7a4c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[var(--bg-surface)]">
          <h3 className="mb-3 text-sm font-semibold">Revenue Recovered</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ed" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${formatNumber(v)}`} />
                <Line type="monotone" dataKey="revenue" stroke="#1a7a4c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[var(--bg-surface)]">
          <h3 className="mb-3 text-sm font-semibold">Signal Source Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={signalBreakdown}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  label={({ source, count }) => `${source} (${count})`}
                >
                  {signalBreakdown.map((entry, index) => (
                    <Cell key={entry.source} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-5 bg-[var(--bg-surface)]">
        <h3 className="mb-3 text-sm font-semibold">Rescue Activity Table</h3>
        <DataTable
          columns={[
            { key: 'signalSource', label: 'Signal Source' },
            { key: 'rescueMethod', label: 'Rescue Method' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'sale', label: 'Sale?' },
            {
              key: 'recoveredAmount',
              label: 'Recovered Amount',
              render: (row) =>
                row.recoveredAmount ? `$${formatNumber(row.recoveredAmount)}` : '—',
            },
            {
              key: 'actions',
              label: 'Fingerprint',
              render: (row) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenFingerprint?.(row.leadId)}
                >
                  Open Fingerprint
                </Button>
              ),
            },
          ]}
          rows={activity}
          pageSize={6}
        />
      </Card>
    </section>
  )
}
