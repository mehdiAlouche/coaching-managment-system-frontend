import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../components/dashboard/StatsCards'
import UpcomingSessions from '../components/dashboard/UpcomingSessions'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import GoalOverview from '../components/dashboard/GoalOverview'
import PaymentsTable from '../components/dashboard/PaymentsTable'
import UsersTable from '../components/dashboard/UsersTable'
import { useDashboardStats, useSessions, usePayments, useUsers, useGoals } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
import { can } from '../lib/rbac'

export const Route = createFileRoute('/_authenticated/dashboard/manager')({
  component: ManagerDashboard,
})

function ManagerDashboard() {
  const { user } = useAuth()
  const rbacCtx = { role: user?.role ?? 'manager' as const }
  const { data: stats } = useDashboardStats()
  const { data: sessions } = useSessions({ status: 'scheduled' })
  const { data: goals } = useGoals()
  const { data: payments } = usePayments({ status: 'pending' })
  const { data: users } = useUsers()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
      {stats && <StatsCards stats={stats} />}
      {sessions && <UpcomingSessions sessions={sessions.slice(0, 5)} />}
      {goals && <GoalOverview goals={goals.slice(0, 6)} />}
      {payments && can(rbacCtx, 'view', 'payments') && <PaymentsTable items={payments.slice(0, 5)} />}
      {users && can(rbacCtx, 'view', 'users') && <UsersTable items={users.slice(0, 8)} />}
      <ActivityFeed items={[]} />
    </div>
  )
}

