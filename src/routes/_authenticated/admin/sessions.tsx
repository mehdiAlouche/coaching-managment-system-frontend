import { createFileRoute } from '@tanstack/react-router'
import AdminSessionsPage from '@/pages/admin/AdminSessionsPage'

export const Route = createFileRoute('/_authenticated/admin/sessions')({
  component: AdminSessionsPage,
})
