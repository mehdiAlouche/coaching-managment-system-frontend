import { createFileRoute } from '@tanstack/react-router'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: AdminDashboardPage,
})
