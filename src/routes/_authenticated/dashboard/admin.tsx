import { createFileRoute } from '@tanstack/react-router'
import StatsCards from '../../../components/dashboard/StatsCards'
import UsersTable from '../../../components/dashboard/UsersTable'
import { useDashboardStats, useUsers } from '../../../hooks'
import { useAuth } from '../../../context/AuthContext'
import { can } from '../../../lib/rbac'

export const Route = createFileRoute('/_authenticated/dashboard/admin')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { user } = useAuth()
  const rbacCtx = { role: user?.role ?? 'admin' as const }
  const { data: stats } = useDashboardStats({ scope: 'admin' })
  const { data: users } = useUsers()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Admin'}! ⚡
          </h1>
          <p className="text-gray-600 text-lg">System overview and user management</p>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards title="Usage Metrics" stats={stats} />}

        {/* Users Table */}
        {users && Array.isArray(users) && can(rbacCtx, 'view', 'users') && (
          <UsersTable items={users.slice(0, 12)} />
        )}
      </div>
    </div>
  )
}
