import { createFileRoute } from '@tanstack/react-router'
import SessionsPage from '@/pages/session/SessionsPage'

export const Route = createFileRoute('/_authenticated/sessions/')({
  component: SessionsPage,
})
