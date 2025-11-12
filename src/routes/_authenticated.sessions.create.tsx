import { createFileRoute } from '@tanstack/react-router'
import CreateSessionPage from '../pages/CreateSessionPage.tsx'

export const Route = createFileRoute('/_authenticated/sessions/create')({
  component: CreateSessionPage,
})
