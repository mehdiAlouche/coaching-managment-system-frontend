import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../../../components/dashboard/StatsCards'
import UpcomingSessions from '../../../components/dashboard/UpcomingSessions'
import ActivityFeed from '../../../components/dashboard/ActivityFeed'
import GoalOverview from '../../../components/dashboard/GoalOverview'
import PaymentsTable from '../../../components/dashboard/PaymentsTable'
import UsersTable from '../../../components/dashboard/UsersTable'
import { useDashboardStats, useSessions, usePayments, useUsers, useGoals } from '../../../hooks'
import { useAuth } from '../../../context/AuthContext'
import { can } from '../../../lib/rbac'

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Manager'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Manage your coaching organization and track performance</p>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {sessions && Array.isArray(sessions) && (
              <UpcomingSessions sessions={sessions.slice(0, 5)} />
            )}
            {goals && Array.isArray(goals) && (
              <GoalOverview goals={goals.slice(0, 6)} />
            )}
            {users && Array.isArray(users) && can(rbacCtx, 'view', 'users') && (
              <UsersTable items={users.slice(0, 8)} />
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            {payments && Array.isArray(payments) && can(rbacCtx, 'view', 'payments') && (
              <PaymentsTable items={payments.slice(0, 5)} />
            )}
            <ActivityFeed items={[]} />
          </div>
        </div>
      </div>
    </div>
  )
}
