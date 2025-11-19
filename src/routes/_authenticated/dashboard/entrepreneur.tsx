import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '../../../models'
import StatsCards from '../../../components/dashboard/StatsCards'
import UpcomingSessions from '../../../components/dashboard/UpcomingSessions'
import GoalOverview from '../../../components/dashboard/GoalOverview'
import { useDashboardStats, useSessions, useGoals } from '../../../hooks'
import { useAuth } from '../../../context/AuthContext'

export const Route = createFileRoute('/_authenticated/dashboard/entrepreneur')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.ENTREPRENEUR) {
      throw redirect({ to: '/' })
    }
  },
  component: EntrepreneurDashboard,
})

function EntrepreneurDashboard() {
  const { user } = useAuth()
  const { data: stats } = useDashboardStats({ scope: 'entrepreneur' })
  const { data: sessions } = useSessions({ scope: 'entrepreneur' })
  const { data: goals } = useGoals({ scope: 'entrepreneur' })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Entrepreneur'}! 🚀
          </h1>
          <p className="text-gray-600 text-lg">Track your progress and upcoming coaching sessions</p>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content */}
        <div className="space-y-8">
          {sessions && Array.isArray(sessions) && (
            <UpcomingSessions title="Your Sessions" sessions={sessions.slice(0, 6)} />
          )}
          {goals && Array.isArray(goals) && (
            <GoalOverview goals={goals.slice(0, 6)} />
          )}
        </div>
      </div>
    </div>
  )
}
