import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../components/dashboard/StatsCards'
import UpcomingSessions from '../components/dashboard/UpcomingSessions'
import GoalOverview from '../components/dashboard/GoalOverview'
import PaymentsTable from '../components/dashboard/PaymentsTable'
import { useDashboardStats, useSessions, useGoals, usePayments } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
import { can } from '../lib/rbac'

export const Route = createFileRoute('/_authenticated/dashboard/coach')({
  component: CoachDashboard,
})

function CoachDashboard() {
  const { user } = useAuth()
  const rbacCtx = { role: user?.role ?? 'coach' as const }
  const { data: stats } = useDashboardStats({ scope: 'coach' })
  const { data: sessions } = useSessions({ scope: 'coach' })
  const { data: goals } = useGoals({ scope: 'coach' })
  const { data: payments } = usePayments({ scope: 'coach' })

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Coach Dashboard</h1>
      {stats && <StatsCards stats={stats} />}
      {sessions && <UpcomingSessions title="Your Schedule" sessions={sessions.slice(0, 6)} />}
      {goals && <GoalOverview goals={goals.slice(0, 6)} />}
      {payments && can(rbacCtx, 'view', 'payments') && <PaymentsTable items={payments.slice(0, 5)} />}
    </div>
  )
}

