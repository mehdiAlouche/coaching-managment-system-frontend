import { createFileRoute } from '@tanstack/react-router'
import GoalsPage from '../../../pages/GoalsPage'

export const Route = createFileRoute('/_authenticated/goals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GoalsPage />
}
