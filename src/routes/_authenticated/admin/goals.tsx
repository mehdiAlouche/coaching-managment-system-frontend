import { createFileRoute } from '@tanstack/react-router'
import AdminGoalsPage from '@/pages/admin/AdminGoalsPage'

export const Route = createFileRoute('/_authenticated/admin/goals')({
  component: AdminGoalsPage,
})
