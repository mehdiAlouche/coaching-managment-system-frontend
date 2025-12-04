import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '@/models'

export const Route = createFileRoute('/_authenticated/admin/_layout')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.ADMIN) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
