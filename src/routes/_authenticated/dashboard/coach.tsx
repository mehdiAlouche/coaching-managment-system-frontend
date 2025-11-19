import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '../../../models'
import StatsCards from '../../../components/dashboard/StatsCards'
import UpcomingSessions from '../../../components/dashboard/UpcomingSessions'
import GoalOverview from '../../../components/dashboard/GoalOverview'
import PaymentsTable from '../../../components/dashboard/PaymentsTable'
import { useDashboardStats, useSessions, useGoals, usePayments } from '../../../hooks'
import { useAuth } from '../../../context/AuthContext'
import { can } from '../../../lib/rbac'

export const Route = createFileRoute('/_authenticated/dashboard/coach')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.COACH) {
      throw redirect({ to: '/' })
    }
  },
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
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || 'Coach'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Here's what's happening with your coaching sessions today</p>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sessions */}
          <div className="lg:col-span-2 space-y-8">
            {sessions && Array.isArray(sessions) && (
              <UpcomingSessions title="Your Schedule" sessions={sessions.slice(0, 6)} />
            )}
            {goals && Array.isArray(goals) && (
              <GoalOverview goals={goals.slice(0, 6)} />
            )}
          </div>

          {/* Right Column - Payments */}
          <div className="lg:col-span-1">
            {payments && Array.isArray(payments) && can(rbacCtx, 'view', 'payments') && (
              <PaymentsTable items={payments.slice(0, 5)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
