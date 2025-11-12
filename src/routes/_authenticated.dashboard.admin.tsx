import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../components/dashboard/StatsCards'
import UsersTable from '../components/dashboard/UsersTable'
import { useDashboardStats, useUsers } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
import { can } from '../lib/rbac'

export const Route = createFileRoute('/_authenticated/dashboard/admin')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { user } = useAuth()
  const rbacCtx = { role: user?.role ?? 'admin' as const }
  const { data: stats } = useDashboardStats({ scope: 'admin' })
  const { data: users } = useUsers()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {stats && <StatsCards title="Usage Metrics" stats={stats} />}
      {users && can(rbacCtx, 'view', 'users') && <UsersTable items={users.slice(0, 12)} />}
    </div>
  )
}

