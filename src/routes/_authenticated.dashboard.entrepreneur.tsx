import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../components/dashboard/StatsCards'
import UpcomingSessions from '../components/dashboard/UpcomingSessions'
import GoalOverview from '../components/dashboard/GoalOverview'
import { useDashboardStats, useSessions, useGoals } from '../lib/queries'

export const Route = createFileRoute('/_authenticated/dashboard/entrepreneur')({
  component: EntrepreneurDashboard,
})

function EntrepreneurDashboard() {
  const { data: stats } = useDashboardStats({ scope: 'entrepreneur' })
  const { data: sessions } = useSessions({ scope: 'entrepreneur' })
  const { data: goals } = useGoals({ scope: 'entrepreneur' })

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Entrepreneur Dashboard</h1>
      {stats && <StatsCards stats={stats} />}
      {sessions && <UpcomingSessions title="Your Sessions" sessions={sessions.slice(0, 6)} />}
      {goals && <GoalOverview goals={goals.slice(0, 6)} />}
    </div>
  )
}

