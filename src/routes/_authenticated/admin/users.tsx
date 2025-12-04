import { createFileRoute } from '@tanstack/react-router'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsersPage,
})
