import { createFileRoute } from '@tanstack/react-router'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'

export const Route = createFileRoute('/_authenticated/admin/reports')({
  component: AdminReportsPage,
})
