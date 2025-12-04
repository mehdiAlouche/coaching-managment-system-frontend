import { createFileRoute } from '@tanstack/react-router'
import AdminCreateOrganizationPage from '@/pages/admin/AdminCreateOrganizationPage'

export const Route = createFileRoute('/_authenticated/admin/organizations/new')({
  component: AdminCreateOrganizationPage,
})
