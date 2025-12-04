import { createFileRoute } from '@tanstack/react-router'
import AdminOrganizationsPage from '@/pages/admin/AdminOrganizationsPage'

export const Route = createFileRoute('/_authenticated/admin/organizations/')({
  component: AdminOrganizationsPage,
})
