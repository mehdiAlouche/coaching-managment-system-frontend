import { createFileRoute, redirect } from '@tanstack/react-router'
import EditSessionPage from '@/pages/EditSessionPage'

export const Route = createFileRoute('/_authenticated/sessions/$id/edit')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    // Only managers can edit sessions (frontend restriction)
    const allowedRoles = ['manager']
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      throw redirect({ to: '/sessions' })
    }
  },
  component: () => {
    const params = Route.useParams()
    return <EditSessionPage id={params.id} />
  },
})
