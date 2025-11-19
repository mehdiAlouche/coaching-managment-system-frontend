import { createFileRoute } from '@tanstack/react-router'
import SessionsPage from '@/pages/SessionsPage.tsx'

export const Route = createFileRoute('/_authenticated/sessions/')({
  component: SessionsPage,
})
