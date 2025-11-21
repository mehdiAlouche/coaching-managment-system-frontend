import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import SessionDetailsPage from '@/pages/SessionDetailsPage'

export const Route = createFileRoute('/_authenticated/sessions/$id')({
  component: SessionIdRoute,
})

function SessionIdRoute() {
  const params = Route.useParams()
  const matchRoute = useMatchRoute()
  
  // Check if we're on the edit route
  const isEditRoute = matchRoute({ to: '/sessions/$id/edit', params })
  
  if (isEditRoute) {
    return <Outlet />
  }
  
  return <SessionDetailsPage id={params.id} />
}
