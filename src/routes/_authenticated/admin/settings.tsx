import { createFileRoute } from '@tanstack/react-router'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: AdminSettingsPage,
})
