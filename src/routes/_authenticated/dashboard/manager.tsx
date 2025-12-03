import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { UserRole, type Session } from '../../../models'
import { useAuth } from '../../../context/AuthContext'
import { apiClient, endpoints } from '../../../services'
import { useErrorHandler } from '../../../hooks/useErrorHandler'
import { 
  BarChart3,
  PlayCircle,
  CheckCircle2,
  Target,
  CheckSquare,
  Wallet,
  Percent,
  PieChart,
  LineChart,
  Calendar,
  Clock
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/manager')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.MANAGER) {
      throw redirect({ to: '/' })
    }
  },
  component: ManagerDashboard,
})

function ManagerDashboard() {
  const { user } = useAuth()
  const { handleError } = useErrorHandler()

  type ManagerDashboardData = {
    overview: {
      totalSessions: number
      activeSessions: number
      completedSessions: number
      activeGoals: number
      completedGoals: number
      pendingPayments: number
      totalRevenue: number
      completionRate: number
      totalUsers: number
    }
    sessionsByStatus: Record<string, number>
    goalsByPriority: Record<string, number>
    sessionsByMonth: { month: string; count: number }[]
    revenueByWeek: { week: string; revenue: number }[]
    recentSessions: Session[]
    upcomingSessions: Session[]
  }

  const { data, isLoading, error } = useQuery<ManagerDashboardData>({
    queryKey: ['manager-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.dashboard.manager)
      return res.data.data as ManagerDashboardData
    }
  })

  if (error) handleError(error)


  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.firstName || 'Manager'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Manage your coaching organization and track performance</p>
        </div>

        {/* Overview Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Sessions', value: data?.overview.totalSessions ?? '—', Icon: BarChart3, bg: 'bg-blue-100', fg: 'text-blue-600' },
              { label: 'Active Sessions', value: data?.overview.activeSessions ?? '—', Icon: PlayCircle, bg: 'bg-indigo-100', fg: 'text-indigo-600' },
              { label: 'Completed Sessions', value: data?.overview.completedSessions ?? '—', Icon: CheckCircle2, bg: 'bg-green-100', fg: 'text-green-600' },
              { label: 'Active Goals', value: data?.overview.activeGoals ?? '—', Icon: Target, bg: 'bg-amber-100', fg: 'text-amber-600' },
              { label: 'Completed Goals', value: data?.overview.completedGoals ?? '—', Icon: CheckSquare, bg: 'bg-emerald-100', fg: 'text-emerald-600' },
              { label: 'Pending Payments', value: data?.overview.pendingPayments ?? '—', Icon: Wallet, bg: 'bg-orange-100', fg: 'text-orange-600' },
              { label: 'Total Revenue', value: data ? `$${(data.overview.totalRevenue).toLocaleString()}` : '—', Icon: Wallet, bg: 'bg-teal-100', fg: 'text-teal-600' },
              { label: 'Completion Rate', value: data ? `${Math.round(data.overview.completionRate)}%` : '—', Icon: Percent, bg: 'bg-purple-100', fg: 'text-purple-600' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`ml-4 h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  {stat.Icon ? <stat.Icon className={`h-5 w-5 ${stat.fg}`} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Distributions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DistributionCard title="Sessions by Status" data={data?.sessionsByStatus || {}} color="bg-primary" Icon={PieChart} />
          <DistributionCard title="Goals by Priority" data={data?.goalsByPriority || {}} color="bg-amber-500" Icon={PieChart} />
        </section>

        {/* Trends */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <TrendList
            title="Sessions by Month"
            items={(data?.sessionsByMonth || []).map(i => ({ label: i.month, value: typeof i.count === 'number' ? i.count : 0 }))}
            Icon={BarChart3}
          />
          <TrendList
            title="Revenue by Week"
            items={(data?.revenueByWeek || []).map(i => ({ label: i.week, value: typeof i.revenue === 'number' ? i.revenue : 0 }))}
            prefix="$"
            Icon={LineChart}
          />
        </section>

        {/* Sessions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SessionList title="Recent Sessions" sessions={data?.recentSessions || []} emptyText="No recent sessions" />
          <SessionList title="Upcoming Sessions" sessions={data?.upcomingSessions || []} emptyText="No upcoming sessions" />
        </section>

        {isLoading && (
          <div className="mt-6 text-sm text-muted-foreground">Loading dashboard…</div>
        )}
      </div>
    </div>
  )
}

function DistributionCard({ title, data, color = 'bg-primary', Icon }: { title: string; data: Record<string, number>; color?: string; Icon?: React.ComponentType<{ className?: string }> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon ? <Icon className="h-5 w-5 text-muted-foreground" /> : null}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          const pct = Math.round((value / total) * 100)
          const label = key.replace('_', ' ')
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="capitalize">{label}</span>
                <span>{value} ({pct}%)</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {Object.keys(data).length === 0 && (
          <p className="text-sm text-muted-foreground">No data</p>
        )}
      </div>
    </div>
  )
}

function TrendList({ title, items, prefix = '', Icon }: { title: string; items: { label: string; value: number }[]; prefix?: string; Icon?: React.ComponentType<{ className?: string }> }) {
  const normalizedItems = items.map(it => ({
    label: it.label,
    value: Number.isFinite(it.value) ? it.value : 0,
  }))
  const max = Math.max(1, ...normalizedItems.map(i => i.value))
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon ? <Icon className="h-5 w-5 text-muted-foreground" /> : null}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {normalizedItems.map((it, idx) => (
          <div key={`${it.label}-${idx}`} className="flex items-center gap-3">
            <div className="w-28 text-sm text-muted-foreground truncate">{it.label}</div>
            <div className="flex-1 h-2 bg-muted rounded">
              <div className="h-2 bg-primary rounded" style={{ width: `${max ? (it.value / max) * 100 : 0}%` }} />
            </div>
            <div className="w-16 text-right text-sm text-foreground">{prefix}{it.value.toLocaleString()}</div>
          </div>
        ))}
        {normalizedItems.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
      </div>
    </div>
  )
}

function SessionList({ title, sessions, emptyText }: { title: string; sessions: Session[]; emptyText: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {sessions.map(s => {
          const date = new Date(s.scheduledAt)
          const label = s.entrepreneur?.firstName ? `${s.entrepreneur.firstName} ${s.entrepreneur.lastName ?? ''}`.trim() : 'Session'
          return (
            <Link
              key={s._id}
              to="/sessions/$id"
              params={{ id: s._id }}
              className="block rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition p-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground truncate">{label}</span>
                <span className="ml-2 text-[10px] text-muted-foreground capitalize">{s.status.replace('_',' ')}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {date.toLocaleString()}
              </div>
            </Link>
          )
        })}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">{emptyText}</p>
        )}
      </div>
    </div>
  )
}
